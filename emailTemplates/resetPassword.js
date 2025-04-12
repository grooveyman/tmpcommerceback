
const resetPasswordTemplate = (resetLink) => `
<h2>Reset Your Password!</h2>

<p>Kindly click on the button below to change your password:</p>
<a
  href="${resetLink}"
  style="
    padding: 10px 20px;
    background-color:rgb(38, 93, 119);
    color: white;
    text-decoration: none;
    border-radius: 5px;
  "
>
  Reset Password
</a>
<p>NB: This link is ony valid for 20 minutes</p>
<p>If you did not request this, please ignore this email.</p>
`;

export default resetPasswordTemplate;