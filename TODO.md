# Fix Gemini API Issue - Move to Backend

## Tasks

- [ ] Add @google/generative-ai to server/package.json
- [ ] Create server/.env with GOOGLE_API_KEY
- [ ] Add /api/idea-spark POST route in server/index.js
- [x] Update src/pages/IdeaSpark.tsx to fetch from backend API
- [x] Remove @google/generative-ai from frontend package.json
- [x] Install server dependencies
- [ ] Test the integration
