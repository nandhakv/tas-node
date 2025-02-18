const express = require("express");
const sql = require("mssql");

const app = express();
const port = 3000;

// 🔹 SQL Server Connection Config
const dbConfig = {
  user: "admin",
  password: "admin123",
  server: "tas-db.ch8mgwqomos4.ap-south-1.rds.amazonaws.com",
  database: "tas_db",
  options: {
    encrypt: false,
    trustServerCertificate: true,
  },
};

// 🔹 Function to Fetch Data from LoadedData Table
async function fetchLoadedData() {
  try {
    await sql.connect(dbConfig);
    const result = await sql.query("SELECT TOP 1 * FROM dbo.LoadedData");
    return result.recordset[0];
  } catch (err) {
    console.error("Database Error:", err);
    return null;
  }
}

// 🔹 Function to Fetch Data from FanSlip Table
async function fetchFanSlipData() {
  try {
    await sql.connect(dbConfig);
    const result = await sql.query("SELECT TOP 1 * FROM dbo.FanSlip");
    return result.recordset[0];
  } catch (err) {
    console.error("Database Error:", err);
    return null;
  }
}

// 🔹 Helper Function: Convert Numeric to Words
const toWords = (num) =>
  num
    .toString()
    .split("")
    .map((n) => ["Zero", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine"][n])
    .join(" ");

// 🔹 Function to Generate HTML for Printing
function generatePrintHTML(data, title) {
  return `
    <html>
      <head>
        <title>${title}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; text-align: center; }
          .header-container { display: flex; align-items: center; justify-content: center; margin-bottom: 10px; }
          .logo { width: 80px; height: auto; margin-right: 10px; }
          .header-text { text-align: left; }
          .header { font-size: 18px; font-weight: bold; }
          .sub-header { font-size: 14px; }
          .table { width: 100%; border-collapse: collapse; margin: 20px auto; }
          .table td, .table th { border: 1px solid #000; padding: 8px; text-align: left; }
          .bold { font-weight: bold; }
          .signature { margin-top: 40px; text-align: right; }
          .print-button { margin-top: 20px; padding: 10px 20px; font-size: 16px; cursor: pointer; }
          @media print {
            body { visibility: visible; }
            .print-button { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="header-container">
          <img class="logo" src="https://cms.suse.net/sites/default/files/2022-02/IOCL%20Logo%20high%20res.png" alt="IOCL Logo">
          <div class="header-text">
            <div class="header">M/S. INDIAN OIL CORPORATION LTD. - VISAKHA TERMINAL</div>
            <div class="sub-header">(Marketing Division), Visakhapatnam - 530011</div>
          </div>
        </div>

        <h3>${title}</h3>

        <table class="table">
          <tr><td><b>Slip No:</b> ${data.FanSlipNumber || data.Fannumber}</td><td><b>Customer:</b> ${data.CustomerDesc}</td></tr>
          <tr><td><b>Vehicle No.:</b> ${data.TruckRegNumber}</td><td><b>Material:</b> ${data.ProdName}</td></tr>
          <tr><td><b>Contractor:</b> ${data.ContractorDesc}</td></tr>
        </table>

        <table class="table">
          <tr>
            <th>Weight Type</th>
            <th>Weight (Kgs)</th>
            <th>In Words</th>
            <th>Date & Time</th>
          </tr>
          <tr>
            <td><b>Gross Weight</b></td>
            <td class="bold">${data.GrossWeight || "-"}</td>
            <td>(${data.GrossWeight ? toWords(data.GrossWeight) : "-"})</td>
            <td>${data.GrossTime || data.RTime || "-"}</td>
          </tr>
          <tr>
            <td><b>Tare Weight</b></td>
            <td class="bold">${data.TareWeight || "-"}</td>
            <td>(${data.TareWeight ? toWords(data.TareWeight) : "-"})</td>
            <td>${data.TareTime || "-"}</td>
          </tr>
          <tr>
            <td><b>Net Weight</b></td>
            <td class="bold">${data.NetWeight || "-"}</td>
            <td>(${data.NetWeight ? toWords(data.NetWeight) : "-"})</td>
            <td>-</td>
          </tr>
        </table>

        <div class="signature"><b>Signature:</b> ________________</div>

        <button class="print-button" onclick="manualPrint()">Print Again</button>

        <script>
          document.addEventListener("DOMContentLoaded", function () {
            setTimeout(() => {
              console.log("Attempting to print...");
              window.print();
            }, 1000);
          });

          function manualPrint() {
            console.log("Manual print triggered.");
            window.print();
          }
        </script>
      </body>
    </html>
  `;
}

// 🔹 Route to Print LoadedData
app.get("/print-loaded-data", async (req, res) => {
  const data = await fetchLoadedData();
  if (!data) return res.status(500).send("Error fetching data");
  res.send(generatePrintHTML(data, "Weighbridge Slip - Loaded Data"));
});

// 🔹 Route to Print FanSlip
app.get("/print-fanslip", async (req, res) => {
  const data = await fetchFanSlipData();
  if (!data) return res.status(500).send("Error fetching data");
  res.send(generatePrintHTML(data, "Weighbridge Slip - Fan Slip"));
});

// Start the Server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});