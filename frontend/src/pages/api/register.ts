export const prerender = false;

import type { APIRoute } from "astro";
import { google } from "googleapis";

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { name, contact, email, affiliation, club, food, seatId } = body;

    if (!seatId || !name || !contact || !email || !affiliation || !food) {
      return new Response("Missing required fields", { status: 400 });
    }

    const credentials = JSON.parse(import.meta.env.GOOGLE_SERVICE_ACCOUNT_KEY);

    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });

    const sheets = google.sheets({ version: "v4", auth });
    const spreadsheetId = import.meta.env.GOOGLE_SHEET_ID;

    // Read seat_id column (A)
    const readRes = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: "A2:A1000", // adjust based on expected seat count
    });

    const seatIds = readRes.data.values?.flat() || [];
    const rowIndex = seatIds.indexOf(String(seatId));

    if (rowIndex === -1) {
      return new Response("Seat ID not found in sheet", { status: 404 });
    }

    // Calculate row number (since A2 = row 2)
    const rowNumber = rowIndex + 2;

    // Update seat as reserved + fill registration details (B → H)
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `B${rowNumber}:H${rowNumber}`,
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: [[
          "TRUE",         // Column B: reserved
          name,           // Column C
          contact,        // Column D
          email,          // Column E
          affiliation,    // Column F
          club || "",     // Column G
          food            // Column H
        ]]
      }
    });

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (err: any) {
    console.error("Google Sheets API error:", err);
    return new Response("Error saving registration", { status: 500 });
  }
};
