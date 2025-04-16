const cors = require("cors");

// Add debugging middleware 
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  console.log('Origin:', req.headers.origin);
  console.log('Headers:', JSON.stringify(req.headers, null, 2));
  next();
});

const allowedOrigins = [
  "http://localhost:3000",
  /^https:\/\/.*\.vercel\.app$/,
  "https://shlichuslinkstake2-frontend-ol96suvt5.vercel.app" // Your specific Vercel URL
];

app.use(cors({
  origin: function (origin, callback) {
    // For debugging
    console.log('Request origin:', origin);
    
    if (!origin || allowedOrigins.some(o => (typeof o === 'string' ? o === origin : o.test(origin)))) {
      // Log success
      console.log('✅ CORS allowed for:', origin);
      callback(null, true);
    } else {
      console.error("❌ Blocked by CORS:", origin);
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

// Add explicit OPTIONS handling for preflight requests
app.options('*', cors());