document.getElementById('login-form').addEventListener('submit', function(e) {
  e.preventDefault();
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;
  const errorDiv = document.getElementById('login-error');
  const loginBtn = document.getElementById('login-btn');
  const btnSpinner = document.getElementById('btnSpinner');
  const btnText = loginBtn.querySelector('.btn-text');

  // Hide error, show spinner, disable button
  errorDiv.classList.remove('show');
  errorDiv.style.display = 'none';
  btnSpinner.style.display = 'inline-block';
  btnText.style.display = 'none';
  loginBtn.disabled = true;

  // Check credentials in Firebase under 'admins' node
  database.ref('admins').orderByChild('email').equalTo(email).once('value', function(snapshot) {
    if (snapshot.exists()) {
      let found = false;
      let adminNodeKey = null;
      snapshot.forEach(function(child) {
        const admin = child.val();
        if (admin.password === password) {
          found = true;
          adminNodeKey = child.key;
        }
      });
      if (found) {
        // Save login state (simple localStorage for now)
        localStorage.setItem('adminLoggedIn', 'true');
        localStorage.setItem('adminEmail', email); // Store email for session
        // Update lastlogin in Firebase
        database.ref('admins/' + adminNodeKey).update({ lastlogin: new Date().toLocaleString() });
        window.location.href = 'index.html';
      } else {
        showError('Invalid password.');
      }
    } else {
      showError('No admin found with this email.');
    }
  }, function(error) {
    showError('Login failed. Please try again.');
  });

  function showError(msg) {
    errorDiv.textContent = msg;
    errorDiv.style.display = 'block';
    setTimeout(() => errorDiv.classList.add('show'), 10);
    btnSpinner.style.display = 'none';
    btnText.style.display = 'inline-block';
    loginBtn.disabled = false;
  }
}); 