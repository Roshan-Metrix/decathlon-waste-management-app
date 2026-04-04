export const PASSWORD_RESET_TEMPLATE = `
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml">

<head>
  <title>Password Reset</title>
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link href="https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;600&display=swap" rel="stylesheet" type="text/css">
  <style type="text/css">
    body {
      margin: 0;
      padding: 0;
      font-family: 'Open Sans', sans-serif;
      background: #E5E5E5;
    }
    table, td {
      border-collapse: collapse;
    }
    .container {
      width: 100%;
      max-width: 500px;
      margin: 70px 0px;
      background-color: #ffffff;
    }
    .main-content {
      padding: 48px 30px 40px;
      color: #000000;
    }
    .button {
      width: 100%;
      background: #2563eb;
      text-decoration: none;
      display: inline-block;
      padding: 10px 0;
      color: #fff;
      font-size: 14px;
      text-align: center;
      font-weight: bold;
      border-radius: 7px;
    }
    @media only screen and (max-width: 480px) {
      .container {
        width: 80%;
      }
      .button {
        width: 50%;
      }
    }
  </style>
</head>

<body>
  <table width="100%" cellspacing="0" cellpadding="0" border="0" align="center" bgcolor="#F6FAFB">
    <tbody>
      <tr>
        <td valign="top" align="center">
          <table class="container" width="600" cellspacing="0" cellpadding="0" border="0">
            <tbody>
              <tr>
                <td class="main-content">
                  <table width="100%" cellspacing="0" cellpadding="0" border="0">
                    <tbody>
                      <tr>
                        <td><img src="https://raw.githubusercontent.com/Roshan-Metrix/Waste_Managment_Authority_MobileApp/refs/heads/master/frontend/assets/splash-icon.png" alt="Decathron Waste Manage" width="340" height="60" /></td>
                      </tr>
                      <tr>
                        <td style="padding: 0 0 24px; font-size: 18px; line-height: 150%; font-weight: bold;">
                          Forgot your password?
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 0 0 10px; font-size: 14px; line-height: 150%;">
                          We received a password reset request for your account: <span style="color: #4C83EE;">{{email}}</span>.
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 0 0 16px; font-size: 14px; line-height: 150%; font-weight: 700;">
                          Use the OTP below to reset the password.
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 0 0 24px;">
                          <p class="button" >{{otp}}</p>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 0 0 10px; font-size: 14px; line-height: 150%;">
                          The password reset otp is only valid for the next 15 minutes.
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </td>
              </tr>
            </tbody>
          </table>
        </td>
      </tr>
    </tbody>
  </table>
</body>
</html>
`;

export const PASSWORD_RESET_SUCCESSFULLY_TEMPLATE = `
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml">

<head>
  <title>Email Verify</title>
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link href="https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;600&display=swap" rel="stylesheet" type="text/css">
  <style type="text/css">
    body {
      margin: 0;
      padding: 0;
      font-family: 'Open Sans', sans-serif;
      background: #E5E5E5;
    }

    table, td {
      border-collapse: collapse;
    }

    .container {
      width: 100%;
      max-width: 500px;
      margin: 70px 0px;
      background-color: #ffffff;
    }

    .main-content {
      padding: 48px 30px 40px;
      color: #000000;
    }

    .button {
      width: 100%;
      background: #2563eb;
      text-decoration: none;
      display: inline-block;
      padding: 10px 0;
      color: #fff;
      font-size: 14px;
      text-align: center;
      font-weight: bold;
      border-radius: 7px;
    }

    @media only screen and (max-width: 480px) {
      .container {
        width: 80%;
      }

      .button {
        width: 50%;
      }
    }
  </style>
</head>

<body>
  <table width="100%" cellspacing="0" cellpadding="0" border="0" align="center" bgcolor="#F6FAFB">
    <tbody>
      <tr>
        <td valign="top" align="center">
          <table class="container" width="600" cellspacing="0" cellpadding="0" border="0">
            <tbody>
             <tr>
               <td><img src="https://raw.githubusercontent.com/Roshan-Metrix/Waste_Managment_Authority_MobileApp/refs/heads/master/frontend/assets/splash-icon.png" alt="Decathron Waste Manage" width="340" height="60" /></td>
                      </tr>
              <tr>
                <td class="main-content">
                  <table width="100%" cellspacing="0" cellpadding="0" border="0">
                    <tbody>
                      <tr>
                        <td style="padding: 0 0 24px; font-size: 18px; line-height: 150%; font-weight: bold;">
                          Password Reset Successfully
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 0 0 10px; font-size: 14px; line-height: 150%;">
                     Your Password for Decathron Waste Manage reset successfully with email id :<span style="color: #4C83EE;">{{email}}</span>.
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </td>
              </tr>
            </tbody>
          </table>
        </td>
      </tr>
    </tbody>
  </table>
</body>
</html>

`;

export const ADMIN_ADDED_TEMPLATE = `
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml">

<head>
  <title>Password Reset</title>
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link href="https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;600&display=swap" rel="stylesheet" type="text/css">
  <style type="text/css">
    body {
      margin: 0;
      padding: 0;
      font-family: 'Open Sans', sans-serif;
      background: #E5E5E5;
    }
    table, td {
      border-collapse: collapse;
    }
    .container {
      width: 100%;
      max-width: 500px;
      margin: 70px 0px;
      background-color: #ffffff;
    }
    .main-content {
      padding: 48px 30px 40px;
      color: #000000;
    }
    .button {
      width: 100%;
      background: #2563eb;
      text-decoration: none;
      display: inline-block;
      padding: 10px 0;
      color: #fff;
      font-size: 14px;
      text-align: center;
      font-weight: bold;
      border-radius: 7px;
    }
    @media only screen and (max-width: 480px) {
      .container {
        width: 80%;
      }
      .button {
        width: 50%;
      }
    }
  </style>
</head>

<body>
  <table width="100%" cellspacing="0" cellpadding="0" border="0" align="center" bgcolor="#F6FAFB">
    <tbody>
      <tr>
        <td valign="top" align="center">
          <table class="container" width="600" cellspacing="0" cellpadding="0" border="0">
            <tbody>
              <tr>
                <td class="main-content">
                  <table width="100%" cellspacing="0" cellpadding="0" border="0">
                    <tbody>
                      <tr>
                        <td><img src="https://raw.githubusercontent.com/Roshan-Metrix/Waste_Managment_Authority_MobileApp/refs/heads/master/frontend/assets/splash-icon.png" alt="Decathron Waste Manage" width="340" height="60" /></td>
                      </tr>
                      <tr>
                        <td style="padding: 0 0 24px; font-size: 18px; line-height: 150%; font-weight: bold;">
                          Welcome to Decathlon
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 0 0 10px; font-size: 14px; line-height: 150%;">
                          Your account is successfully created as Admin : <span style="color: #4C83EE;">{{email}}</span>.
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 0 0 10px; font-size: 14px; line-height: 150%;">
                          Your password : <span style="color: #4C83EE;">{{password}}</span>.
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 0 0 16px; font-size: 14px; line-height: 150%; font-weight: 700;">
                          Please update the password.
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 0 0 10px; font-size: 14px; line-height: 150%;">
                          Thank You ! Decathlon
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </td>
              </tr>
            </tbody>
          </table>
        </td>
      </tr>
    </tbody>
  </table>
</body>
</html>
`;

export const MANAGER_ADDED_TEMPLATE = `
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml">

<head>
  <title>Password Reset</title>
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link href="https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;600&display=swap" rel="stylesheet" type="text/css">
  <style type="text/css">
    body {
      margin: 0;
      padding: 0;
      font-family: 'Open Sans', sans-serif;
      background: #E5E5E5;
    }
    table, td {
      border-collapse: collapse;
    }
    .container {
      width: 100%;
      max-width: 500px;
      margin: 70px 0px;
      background-color: #ffffff;
    }
    .main-content {
      padding: 48px 30px 40px;
      color: #000000;
    }
    .button {
      width: 100%;
      background: #2563eb;
      text-decoration: none;
      display: inline-block;
      padding: 10px 0;
      color: #fff;
      font-size: 14px;
      text-align: center;
      font-weight: bold;
      border-radius: 7px;
    }
    @media only screen and (max-width: 480px) {
      .container {
        width: 80%;
      }
      .button {
        width: 50%;
      }
    }
  </style>
</head>

<body>
  <table width="100%" cellspacing="0" cellpadding="0" border="0" align="center" bgcolor="#F6FAFB">
    <tbody>
      <tr>
        <td valign="top" align="center">
          <table class="container" width="600" cellspacing="0" cellpadding="0" border="0">
            <tbody>
              <tr>
                <td class="main-content">
                  <table width="100%" cellspacing="0" cellpadding="0" border="0">
                    <tbody>
                      <tr>
                        <td><img src="https://raw.githubusercontent.com/Roshan-Metrix/Waste_Managment_Authority_MobileApp/refs/heads/master/frontend/assets/splash-icon.png" alt="Decathron Waste Manage" width="340" height="60" /></td>
                      </tr>
                      <tr>
                        <td style="padding: 0 0 24px; font-size: 18px; line-height: 150%; font-weight: bold;">
                          Welcome to Decathlon
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 0 0 10px; font-size: 14px; line-height: 150%;">
                          Your account is successfully created as Manager : <span style="color: #4C83EE;">{{email}}</span>.
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 0 0 10px; font-size: 14px; line-height: 150%;">
                          Your password : <span style="color: #4C83EE;">{{password}}</span>.
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 0 0 16px; font-size: 14px; line-height: 150%; font-weight: 700;">
                          Please update the password.
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 0 0 10px; font-size: 14px; line-height: 150%;">
                          Thank You ! Decathlon
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </td>
              </tr>
            </tbody>
          </table>
        </td>
      </tr>
    </tbody>
  </table>
</body>
</html>
`;

export const STORE_ADDED_TEMPLATE = `
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml">

<head>
  <title>Password Reset</title>
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link href="https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;600&display=swap" rel="stylesheet" type="text/css">
  <style type="text/css">
    body {
      margin: 0;
      padding: 0;
      font-family: 'Open Sans', sans-serif;
      background: #E5E5E5;
    }
    table, td {
      border-collapse: collapse;
    }
    .container {
      width: 100%;
      max-width: 500px;
      margin: 70px 0px;
      background-color: #ffffff;
    }
    .main-content {
      padding: 48px 30px 40px;
      color: #000000;
    }
    .button {
      width: 100%;
      background: #2563eb;
      text-decoration: none;
      display: inline-block;
      padding: 10px 0;
      color: #fff;
      font-size: 14px;
      text-align: center;
      font-weight: bold;
      border-radius: 7px;
    }
    @media only screen and (max-width: 480px) {
      .container {
        width: 80%;
      }
      .button {
        width: 50%;
      }
    }
  </style>
</head>

<body>
  <table width="100%" cellspacing="0" cellpadding="0" border="0" align="center" bgcolor="#F6FAFB">
    <tbody>
      <tr>
        <td valign="top" align="center">
          <table class="container" width="600" cellspacing="0" cellpadding="0" border="0">
            <tbody>
              <tr>
                <td class="main-content">
                  <table width="100%" cellspacing="0" cellpadding="0" border="0">
                    <tbody>
                      <tr>
                        <td><img src="https://raw.githubusercontent.com/Roshan-Metrix/Waste_Managment_Authority_MobileApp/refs/heads/master/frontend/assets/splash-icon.png" alt="Decathron Waste Manage" width="340" height="60" /></td>
                      </tr>
                      <tr>
                        <td style="padding: 0 0 24px; font-size: 18px; line-height: 150%; font-weight: bold;">
                          Welcome to Decathlon
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 0 0 10px; font-size: 14px; line-height: 150%;">
                          Your account is successfully created as Store : <span style="color: #4C83EE;">{{email}}</span>.
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 0 0 10px; font-size: 14px; line-height: 150%;">
                          Your password : <span style="color: #4C83EE;">{{password}}</span>.
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 0 0 16px; font-size: 14px; line-height: 150%; font-weight: 700;">
                          Please update the password.
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 0 0 10px; font-size: 14px; line-height: 150%;">
                          Thank You ! Decathlon
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </td>
              </tr>
            </tbody>
          </table>
        </td>
      </tr>
    </tbody>
  </table>
</body>
</html>
`;

export const VENDOR_ADDED_TEMPLATE = `
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml">

<head>
  <title>Password Reset</title>
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link href="https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;600&display=swap" rel="stylesheet" type="text/css">
  <style type="text/css">
    body {
      margin: 0;
      padding: 0;
      font-family: 'Open Sans', sans-serif;
      background: #E5E5E5;
    }
    table, td {
      border-collapse: collapse;
    }
    .container {
      width: 100%;
      max-width: 500px;
      margin: 70px 0px;
      background-color: #ffffff;
    }
    .main-content {
      padding: 48px 30px 40px;
      color: #000000;
    }
    .button {
      width: 100%;
      background: #2563eb;
      text-decoration: none;
      display: inline-block;
      padding: 10px 0;
      color: #fff;
      font-size: 14px;
      text-align: center;
      font-weight: bold;
      border-radius: 7px;
    }
    @media only screen and (max-width: 480px) {
      .container {
        width: 80%;
      }
      .button {
        width: 50%;
      }
    }
  </style>
</head>

<body>
  <table width="100%" cellspacing="0" cellpadding="0" border="0" align="center" bgcolor="#F6FAFB">
    <tbody>
      <tr>
        <td valign="top" align="center">
          <table class="container" width="600" cellspacing="0" cellpadding="0" border="0">
            <tbody>
              <tr>
                <td class="main-content">
                  <table width="100%" cellspacing="0" cellpadding="0" border="0">
                    <tbody>
                      <tr>
                        <td><img src="https://raw.githubusercontent.com/Roshan-Metrix/Waste_Managment_Authority_MobileApp/refs/heads/master/frontend/assets/splash-icon.png" alt="Decathron Waste Manage" width="340" height="60" /></td>
                      </tr>
                      <tr>
                        <td style="padding: 0 0 24px; font-size: 18px; line-height: 150%; font-weight: bold;">
                          Welcome to Decathlon
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 0 0 10px; font-size: 14px; line-height: 150%;">
                          Your account is successfully created as Vendor : <span style="color: #4C83EE;">{{email}}</span>.
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 0 0 10px; font-size: 14px; line-height: 150%;">
                          Your password : <span style="color: #4C83EE;">{{password}}</span>.
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 0 0 16px; font-size: 14px; line-height: 150%; font-weight: 700;">
                          Please update the password.
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 0 0 10px; font-size: 14px; line-height: 150%;">
                          Thank You ! Decathlon
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </td>
              </tr>
            </tbody>
          </table>
        </td>
      </tr>
    </tbody>
  </table>
</body>
</html>
`;

export const DAILY_REPORT_EMAIL_TEMPLATE = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Daily Transaction Report</title>
  <style>
    body {
      margin: 0;
      padding: 24px 0;
      background: #f3f7fb;
      font-family: Arial, sans-serif;
      color: #1f2937;
    }
    .container {
      width: 100%;
      max-width: 720px;
      margin: 0 auto;
      background: #ffffff;
      border-radius: 14px;
      overflow: hidden;
      box-shadow: 0 10px 30px rgba(15, 23, 42, 0.08);
    }
    .header {
      background: linear-gradient(135deg, #2563eb, #0f766e);
      color: #ffffff;
      padding: 28px 32px;
    }
    .header h1 {
      margin: 0 0 8px;
      font-size: 24px;
    }
    .header p {
      margin: 0;
      font-size: 14px;
      opacity: 0.92;
    }
    .content {
      padding: 28px 32px 20px;
    }
    .intro {
      margin: 0 0 18px;
      font-size: 15px;
      line-height: 1.7;
    }
    .meta {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      padding: 16px 18px;
      margin-bottom: 22px;
      font-size: 14px;
      line-height: 1.8;
    }
    .section-title {
      margin: 0 0 12px;
      font-size: 16px;
      font-weight: 700;
      color: #111827;
    }
    .stats {
      display: table;
      width: 100%;
      margin-bottom: 22px;
    }
    .stat {
      display: table-cell;
      width: 33.33%;
      background: #eff6ff;
      border: 1px solid #dbeafe;
      text-align: center;
      padding: 14px 10px;
    }
    .stat strong {
      display: block;
      font-size: 20px;
      color: #1d4ed8;
      margin-bottom: 6px;
    }
    .stat span {
      font-size: 12px;
      color: #475569;
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }
    .data-table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 8px;
      font-size: 14px;
    }
    .data-table th,
    .data-table td {
      border: 1px solid #e5e7eb;
      padding: 10px 12px;
      text-align: left;
    }
    .data-table th {
      background: #eff6ff;
      color: #1e3a8a;
    }
    .data-table tfoot td,
    .total-row td {
      background: #f8fafc;
      font-weight: 700;
    }
    .footer {
      padding: 0 32px 28px;
      color: #64748b;
      font-size: 13px;
      line-height: 1.7;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Daily Transaction Report</h1>
      <p>Report Date: {{reportDate}}</p>
    </div>
    <div class="content">
      <p class="intro">Dear {{vendorName}},</p>
      <p class="intro">
        Please find the daily transaction summary for <strong>{{storeName}}</strong>.
        The PDF report is attached with this email for your records.
      </p>

      <div class="meta">
        <div><strong>Vendor:</strong> {{vendorName}}</div>
        <div><strong>Store:</strong> {{storeName}}</div>
        <div><strong>Location:</strong> {{storeLocation}}</div>
        <div><strong>Transactions:</strong> {{totalTransactions}}</div>
        <div><strong>Report Date:</strong> {{reportDate}}</div>
      </div>

      <div class="stats">
        <div class="stat">
          <strong>{{totalItems}}</strong>
          <span>Total Items</span>
        </div>
        <div class="stat">
          <strong>{{totalWeight}}</strong>
          <span>Total Weight (kg)</span>
        </div>
        <div class="stat">
          <strong>{{totalAmount}}</strong>
          <span>Total Amount (INR)</span>
        </div>
      </div>

      <h2 class="section-title">Material Summary</h2>
      {{materialTable}}
    </div>
    <div class="footer">
      This is an automated email from the Decathlon Waste Management System.
      Please do not reply to this mailbox.
    </div>
  </div>
</body>
</html>
`;
