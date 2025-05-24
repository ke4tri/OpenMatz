import 'dotenv/config';

export default {
  expo: {
    name: "OpenMats",
    slug: "openmats",
    version: "1.0.0",
    extra: {
      opencageApiKey: process.env.OPENCAGE_API_KEY,
    },
  },
};
