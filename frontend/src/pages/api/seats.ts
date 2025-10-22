import type { APIRoute } from 'astro';
import { google } from 'googleapis';

export const GET: APIRoute = async () => {
  try {
    const credentials = JSON.parse(import.meta.env.GOOGLE_SERVICE_ACCOUNT_KEY);
    
    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
    });

    const sheets = google.sheets({ version: 'v4', auth });

    const SHEET_ID = import.meta.env.GOOGLE_SHEET_ID;
    const RANGE = 'Sheet1!A2:B'; // A2:B to skip header row

    const noCacheHeaders = {
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
      Pragma: 'no-cache',
      Expires: '0',
      'Content-Type': 'application/json'
    };

    // Fetch data from Google Sheets
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: RANGE,
    });

    const rows = response.data.values;

    if (!rows || rows.length === 0) {
      return new Response(JSON.stringify({ 
        reservedSeats: [],
        success: true,
        message: 'No reserved seats found'
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Parse reserved seats (where column B is TRUE)
    const reservedSeats = rows
      .filter(row => {
        const isReserved = row[1];
        return isReserved === 'TRUE' || isReserved === 'true' || isReserved === true;
      })
      .map(row => parseInt(row[0])); // Get seat_id from column A

    console.log('Reserved seats:', reservedSeats);

    return new Response(JSON.stringify({ 
      reservedSeats,
      success: true,
      count: reservedSeats.length
    }), {
      status: 200,
      headers: noCacheHeaders,
    });

  } catch (error) {
    console.error('Error fetching Google Sheets data:', error);
    return new Response(JSON.stringify({ 
      error: (error as any).message || 'Failed to fetch seat reservations',
      reservedSeats: [],
      success: false 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
