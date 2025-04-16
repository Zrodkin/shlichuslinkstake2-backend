const cors = require("cors");

const allowedOrigins = [
  "http://localhost:3000",
  /^https:\/\/.*\.vercel\.app$/,
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.some(o => (typeof o === 'string' ? o === origin : o.test(origin)))) {
      callback(null, true);
    } else {
      console.error("❌ Blocked by CORS:", origin);
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));
