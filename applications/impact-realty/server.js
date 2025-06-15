const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const winston = require('winston');
const expressWinston = require('express-winston');
const { createClient } = require('@supabase/supabase-js');
const Joi = require('joi');
const { v4: uuidv4 } = require('uuid');

// Load environment variables
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Initialize Winston logger
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { 
    service: 'impact-realty-app',
    tenantId: process.env.TENANT_ID || 'impact-realty',
    environment: process.env.ENVIRONMENT || 'prod'
  },
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    })
  ]
});

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  logger.error('Missing Supabase configuration. Please check SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:"],
      scriptSrc: ["'self'"]
    }
  }
}));

app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
  credentials: true
}));

app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false
});
app.use(limiter);

// Request logging
app.use(expressWinston.logger({
  winstonInstance: logger,
  meta: true,
  msg: 'HTTP {{req.method}} {{req.url}}',
  expressFormat: true,
  colorize: false,
  ignoreRoute: function (req, res) { return false; }
}));

// Health check endpoints
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0',
    tenantId: process.env.TENANT_ID || 'impact-realty',
    environment: process.env.ENVIRONMENT || 'prod'
  });
});

app.get('/ready', async (req, res) => {
  try {
    // Check Supabase connection
    const { error } = await supabase.from('properties').select('count', { count: 'exact', head: true });
    
    if (error && error.code !== 'PGRST116') { // PGRST116 is "table not found" which is OK for this check
      throw error;
    }
    
    res.status(200).json({
      status: 'ready',
      timestamp: new Date().toISOString(),
      checks: {
        supabase: 'connected',
        database: 'accessible'
      }
    });
  } catch (error) {
    logger.error('Readiness check failed:', error);
    res.status(503).json({
      status: 'not ready',
      timestamp: new Date().toISOString(),
      error: 'Database connection failed'
    });
  }
});

// API Routes

// Get all properties
app.get('/api/properties', async (req, res) => {
  try {
    const { page = 1, limit = 10, status, type, minPrice, maxPrice } = req.query;
    
    let query = supabase
      .from('properties')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false });
    
    // Apply filters
    if (status) query = query.eq('status', status);
    if (type) query = query.eq('property_type', type);
    if (minPrice) query = query.gte('price', minPrice);
    if (maxPrice) query = query.lte('price', maxPrice);
    
    // Apply pagination
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.range(from, to);
    
    const { data, error, count } = await query;
    
    if (error) {
      logger.error('Error fetching properties:', error);
      return res.status(500).json({ error: 'Failed to fetch properties' });
    }
    
    res.json({
      data,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count,
        pages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    logger.error('Unexpected error in /api/properties:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get single property
app.get('/api/properties/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const { data, error } = await supabase
      .from('properties')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ error: 'Property not found' });
      }
      logger.error('Error fetching property:', error);
      return res.status(500).json({ error: 'Failed to fetch property' });
    }
    
    res.json(data);
  } catch (error) {
    logger.error('Unexpected error in /api/properties/:id:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create new property
app.post('/api/properties', async (req, res) => {
  try {
    // Validation schema
    const schema = Joi.object({
      title: Joi.string().required().max(200),
      description: Joi.string().required().max(2000),
      address: Joi.string().required().max(500),
      city: Joi.string().required().max(100),
      state: Joi.string().required().max(50),
      zip_code: Joi.string().required().max(20),
      price: Joi.number().required().min(0),
      bedrooms: Joi.number().integer().min(0),
      bathrooms: Joi.number().min(0),
      square_feet: Joi.number().integer().min(0),
      property_type: Joi.string().required().valid('house', 'condo', 'townhouse', 'apartment', 'commercial'),
      status: Joi.string().required().valid('active', 'pending', 'sold', 'inactive'),
      agent_id: Joi.string().uuid(),
      features: Joi.array().items(Joi.string()),
      images: Joi.array().items(Joi.string().uri())
    });
    
    const { error: validationError, value } = schema.validate(req.body);
    if (validationError) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: validationError.details.map(d => d.message) 
      });
    }
    
    // Add metadata
    const propertyData = {
      ...value,
      id: uuidv4(),
      tenant_id: process.env.TENANT_ID || 'impact-realty',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    const { data, error } = await supabase
      .from('properties')
      .insert([propertyData])
      .select()
      .single();
    
    if (error) {
      logger.error('Error creating property:', error);
      return res.status(500).json({ error: 'Failed to create property' });
    }
    
    logger.info('Property created successfully', { propertyId: data.id });
    res.status(201).json(data);
  } catch (error) {
    logger.error('Unexpected error in POST /api/properties:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update property
app.put('/api/properties/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Validation schema for updates
    const schema = Joi.object({
      title: Joi.string().max(200),
      description: Joi.string().max(2000),
      address: Joi.string().max(500),
      city: Joi.string().max(100),
      state: Joi.string().max(50),
      zip_code: Joi.string().max(20),
      price: Joi.number().min(0),
      bedrooms: Joi.number().integer().min(0),
      bathrooms: Joi.number().min(0),
      square_feet: Joi.number().integer().min(0),
      property_type: Joi.string().valid('house', 'condo', 'townhouse', 'apartment', 'commercial'),
      status: Joi.string().valid('active', 'pending', 'sold', 'inactive'),
      agent_id: Joi.string().uuid(),
      features: Joi.array().items(Joi.string()),
      images: Joi.array().items(Joi.string().uri())
    }).min(1);
    
    const { error: validationError, value } = schema.validate(req.body);
    if (validationError) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: validationError.details.map(d => d.message) 
      });
    }
    
    // Add updated timestamp
    const updateData = {
      ...value,
      updated_at: new Date().toISOString()
    };
    
    const { data, error } = await supabase
      .from('properties')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ error: 'Property not found' });
      }
      logger.error('Error updating property:', error);
      return res.status(500).json({ error: 'Failed to update property' });
    }
    
    logger.info('Property updated successfully', { propertyId: id });
    res.json(data);
  } catch (error) {
    logger.error('Unexpected error in PUT /api/properties/:id:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete property
app.delete('/api/properties/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const { error } = await supabase
      .from('properties')
      .delete()
      .eq('id', id);
    
    if (error) {
      logger.error('Error deleting property:', error);
      return res.status(500).json({ error: 'Failed to delete property' });
    }
    
    logger.info('Property deleted successfully', { propertyId: id });
    res.status(204).send();
  } catch (error) {
    logger.error('Unexpected error in DELETE /api/properties/:id:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get application info
app.get('/api/info', (req, res) => {
  res.json({
    name: 'Impact Realty Application',
    version: process.env.npm_package_version || '1.0.0',
    tenantId: process.env.TENANT_ID || 'impact-realty',
    environment: process.env.ENVIRONMENT || 'prod',
    features: {
      supabase: 'enabled',
      authentication: 'available',
      multiTenant: 'enabled',
      monitoring: 'enabled'
    },
    endpoints: {
      health: '/health',
      ready: '/ready',
      properties: '/api/properties',
      info: '/api/info'
    }
  });
});

// Error handling middleware
app.use(expressWinston.errorLogger({
  winstonInstance: logger
}));

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Route not found',
    message: `Cannot ${req.method} ${req.originalUrl}`
  });
});

// Global error handler
app.use((err, req, res, next) => {
  logger.error('Unhandled error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully');
  process.exit(0);
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  logger.info(`Impact Realty application started on port ${PORT}`, {
    tenantId: process.env.TENANT_ID || 'impact-realty',
    environment: process.env.ENVIRONMENT || 'prod',
    supabaseUrl: supabaseUrl
  });
});

module.exports = app; 