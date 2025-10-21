import type { APIRoute } from 'astro';

export const GET: APIRoute = async () => {
  try {
    // Replace with your Google Sheets details
    const SHEET_ID = import.meta.env.GOOGLE_SHEET_ID; // Get this from your Google Sheets URL
    const RANGE = 'Sheet1!A:B'; // Adjust range as needed (columns A and B)
    const API_KEY = import.meta.env.GOOGLE_SHEETS_API_KEY; // Store in .env file

    const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${RANGE}?key=${API_KEY}`;

    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Google Sheets API error: ${response.statusText}`);
    }

    const data = await response.json();
    
    // Parse the data - skip header row
    const reservedSeats = data.values
      .slice(1) // Skip header
      .filter((row: string[]) => row[1] === 'TRUE' || row[1] === 'true')
      .map((row: string[]) => parseInt(row[0])); // Get seat_id

    return new Response(JSON.stringify({ 
      reservedSeats,
      success: true 
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    console.error('Error fetching Google Sheets data:', error);
    return new Response(JSON.stringify({ 
      error: 'Failed to fetch seat reservations',
      reservedSeats: [],
      success: false 
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
};