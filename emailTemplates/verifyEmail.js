
const htmlEmailTemplate = (verificationLink) => `
<h2>Welcome to AzuShop!</h2>
<p>Thank you for signing up on AzuShop</p>

<p>To complete your registration, please verify your email address by clicking the button below:</p>
<a
  href="${verificationLink}"
  style="
    padding: 10px 20px;
    background-color: #4caf50;
    color: white;
    text-decoration: none;
    border-radius: 5px;
  "
>
  Verify Email
</a>

<p>If you did not create an account, please ignore this email.</p>
`;

export default htmlEmailTemplate;