import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

// Swagger definition
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Bike Rental API Documentation',
      version: '1.0.0',
      description: 'API documentation for the Bike Rental System',
      contact: {
        name: 'API Support',
        email: 'support@bikerental.com'
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT'
      }
    },
    servers: [
      {
        url: 'http://localhost:5000',
        description: 'Development server'
      },
      {
        url: 'https://bikerental-api.example.com',
        description: 'Production server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      },
      schemas: {
        User: {
          type: 'object',
          required: ['name', 'email', 'password'],
          properties: {
            id: {
              type: 'string',
              description: 'User ID'
            },
            name: {
              type: 'string',
              description: 'User name'
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'User email'
            },
            password: {
              type: 'string',
              format: 'password',
              description: 'User password'
            },
            role: {
              type: 'string',
              enum: ['customer', 'admin'],
              description: 'User role'
            },
            profilePicture: {
              type: 'string',
              description: 'URL to profile picture'
            },
            phoneNumber: {
              type: 'string',
              description: 'User phone number'
            },
            address: {
              type: 'object',
              properties: {
                street: { type: 'string' },
                city: { type: 'string' },
                state: { type: 'string' },
                zipCode: { type: 'string' },
                country: { type: 'string' }
              }
            },
            isVerified: {
              type: 'boolean',
              description: 'Whether the user is verified'
            }
          }
        },
        Bike: {
          type: 'object',
          required: ['name', 'type', 'hourlyRate', 'dailyRate'],
          properties: {
            id: {
              type: 'string',
              description: 'Bike ID'
            },
            name: {
              type: 'string',
              description: 'Bike name'
            },
            type: {
              type: 'string',
              description: 'Bike type'
            },
            description: {
              type: 'string',
              description: 'Bike description'
            },
            images: {
              type: 'array',
              items: {
                type: 'string'
              },
              description: 'URLs to bike images'
            },
            pricing: {
              type: 'object',
              properties: {
                hourlyRate: {
                  type: 'number',
                  description: 'Hourly rental rate'
                },
                dailyRate: {
                  type: 'number',
                  description: 'Daily rental rate'
                },
                deposit: {
                  type: 'number',
                  description: 'Required deposit amount'
                }
              }
            },
            availability: {
              type: 'object',
              properties: {
                status: {
                  type: 'string',
                  enum: ['available', 'rented', 'maintenance', 'reserved'],
                  description: 'Current bike status'
                }
              }
            },
            specifications: {
              type: 'object',
              properties: {
                brand: { type: 'string' },
                model: { type: 'string' },
                year: { type: 'number' },
                frameSize: { type: 'string' },
                color: { type: 'string' },
                weight: { type: 'number' }
              }
            },
            features: {
              type: 'array',
              items: {
                type: 'string'
              },
              description: 'Bike features'
            },
            location: {
              type: 'object',
              properties: {
                name: { type: 'string' },
                address: { type: 'string' },
                coordinates: {
                  type: 'object',
                  properties: {
                    latitude: { type: 'number' },
                    longitude: { type: 'number' }
                  }
                }
              }
            },
            ratings: {
              type: 'object',
              properties: {
                average: { type: 'number' },
                count: { type: 'number' }
              }
            }
          }
        },
        Booking: {
          type: 'object',
          required: ['bike', 'startDate', 'endDate'],
          properties: {
            id: {
              type: 'string',
              description: 'Booking ID'
            },
            user: {
              type: 'string',
              description: 'User ID'
            },
            bike: {
              type: 'string',
              description: 'Bike ID'
            },
            startDate: {
              type: 'string',
              format: 'date-time',
              description: 'Booking start date and time'
            },
            endDate: {
              type: 'string',
              format: 'date-time',
              description: 'Booking end date and time'
            },
            totalHours: {
              type: 'number',
              description: 'Total hours of rental'
            },
            totalPrice: {
              type: 'number',
              description: 'Total price of rental'
            },
            status: {
              type: 'string',
              enum: ['pending', 'confirmed', 'active', 'completed', 'cancelled'],
              description: 'Booking status'
            },
            paymentMethod: {
              type: 'string',
              description: 'Payment method used'
            },
            paymentStatus: {
              type: 'string',
              enum: ['pending', 'paid', 'refunded', 'failed'],
              description: 'Payment status'
            }
          }
        },
        Error: {
          type: 'object',
          properties: {
            message: {
              type: 'string'
            },
            errors: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  msg: { type: 'string' },
                  param: { type: 'string' },
                  location: { type: 'string' }
                }
              }
            }
          }
        }
      }
    }
  },
  apis: [
    './src/routes/*.js',
    './src/models/*.js',
    './src/controllers/*.js'
  ]
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

/**
 * Initialize Swagger
 * @param {object} app - Express app
 */
export const setupSwagger = (app) => {
  // Swagger UI route
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  
  // Docs in JSON format
  app.get('/api-docs.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
  });
  
  console.log('Swagger documentation available at /api-docs');
};

export default setupSwagger;
