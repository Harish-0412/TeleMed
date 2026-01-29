// OpenStreetMap Overpass API Service
// Fetches real-world medical facilities (pharmacies, hospitals, clinics)

export interface OSMFacility {
    id: string;
    name: string;
    lat: number;
    lng: number;
    type: 'pharmacy' | 'hospital' | 'clinic';
    address: string;
    phone?: string;
    website?: string;
}

export class OSMService {
    private overpassUrl = 'https://overpass-api.de/api/interpreter';

    async fetchNearbyHealthcare(lat: number, lng: number, radiusMeters: number = 7000): Promise<OSMFacility[]> {
        const query = `
      [out:json][timeout:25];
      (
        node["amenity"="pharmacy"](around:${radiusMeters},${lat},${lng});
        way["amenity"="pharmacy"](around:${radiusMeters},${lat},${lng});
        node["amenity"="hospital"](around:${radiusMeters},${lat},${lng});
        way["amenity"="hospital"](around:${radiusMeters},${lat},${lng});
        node["amenity"="clinic"](around:${radiusMeters},${lat},${lng});
        way["amenity"="clinic"](around:${radiusMeters},${lat},${lng});
        node["healthcare"](around:${radiusMeters},${lat},${lng});
        way["healthcare"](around:${radiusMeters},${lat},${lng});
      );
      out body;
      >;
      out skel qt;
    `;

        try {
            const response = await fetch(this.overpassUrl, {
                method: 'POST',
                body: `data=${encodeURIComponent(query)}`,
            });

            if (!response.ok) {
                throw new Error('OSM Overpass API request failed');
            }

            const data = await response.json();
            return this.transformOSMData(data.elements);
        } catch (error) {
            console.error('OSM Fetch Error:', error);
            return [];
        }
    }

    private transformOSMData(elements: any[]): OSMFacility[] {
        return elements
            .filter((el: any) => el.tags && (el.tags.name || el.tags['name:en']))
            .map((el: any) => {
                const tags = el.tags;
                let type: 'pharmacy' | 'hospital' | 'clinic' = 'clinic';

                if (tags.amenity === 'pharmacy' || tags.healthcare === 'pharmacy') type = 'pharmacy';
                else if (tags.amenity === 'hospital' || tags.healthcare === 'hospital') type = 'hospital';
                else if (tags.amenity === 'clinic' || tags.healthcare === 'clinic') type = 'clinic';

                const lat = el.lat || (el.center ? el.center.lat : 0);
                const lng = el.lon || (el.center ? el.center.lon : 0);

                return {
                    id: `osm_${el.id}`,
                    name: tags.name || tags['name:en'] || 'Healthcare Facility',
                    lat,
                    lng,
                    type,
                    address: this.formatAddress(tags),
                    phone: tags.phone || tags['contact:phone'],
                    website: tags.website || tags['contact:website']
                };
            })
            .filter(item => item.lat !== 0 && item.lng !== 0);
    }

    private formatAddress(tags: any): string {
        const parts = [
            tags['addr:street'],
            tags['addr:housenumber'],
            tags['addr:suburb'],
            tags['addr:city']
        ].filter(Boolean);

        return parts.length > 0 ? parts.join(', ') : 'Address not specified';
    }
}

export const osmService = new OSMService();
