# Google Maps API Setup Guide

## 1. Get Google Maps API Key

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable the following APIs:
   - Maps JavaScript API
   - Places API
   - Distance Matrix API
   - Geocoding API

4. Create credentials (API Key)
5. Restrict the API key to your domain for security

## 2. Update the Pharmacy Finder Component

Replace `YOUR_API_KEY` in the pharmacy-finder.tsx file with your actual API key:

```typescript
script.src = `https://maps.googleapis.com/maps/api/js?key=YOUR_ACTUAL_API_KEY&libraries=places`;
```

## 3. Add to HTML Head (Alternative Method)

You can also add the script directly to your HTML head in `client/index.html`:

```html
<script
  src="https://maps.googleapis.com/maps/api/js?key=YOUR_API_KEY&libraries=places"
  async
  defer
></script>
```

## 4. Environment Variables (Recommended)

Create a `.env` file in your client directory:

```
VITE_GOOGLE_MAPS_API_KEY=your_actual_api_key_here
```

Then update the component to use:

```typescript
script.src = `https://maps.googleapis.com/maps/api/js?key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}&libraries=places`;
```

## 5. Features Implemented

✅ **Current Location Detection**
- Uses navigator.geolocation.getCurrentPosition()
- Shows user location on map with custom marker

✅ **Google Maps Integration**
- Interactive map with custom styling
- User location marker (blue dot)
- Pharmacy markers (green cross)
- Clinic markers (red cross)

✅ **Places Search**
- Searches for nearby pharmacies within 5km
- Searches for nearby hospitals/clinics within 5km
- Uses Google Places API nearbySearch

✅ **Distance & Time Calculation**
- Uses Google Distance Matrix API
- Shows driving distance and estimated time
- Sorts results by distance

✅ **Interactive Features**
- Click markers to see info windows
- "Directions" button opens Google Maps
- "Call" button for phone numbers
- Tabbed interface for pharmacies vs clinics

✅ **Responsive Design**
- Split layout: List on left, Map on right
- Mobile-friendly responsive design
- Loading states and error handling

## 6. Usage

1. Navigate to `/pharmacy` in your app
2. Click "Get Location" to enable location services
3. View nearby pharmacies and clinics
4. Click on markers or list items for details
5. Use "Directions" to navigate in Google Maps

## 7. Testing Without API Key

For testing purposes, you can use a demo mode by replacing the Google Maps calls with mock data. The component structure is ready for real API integration.