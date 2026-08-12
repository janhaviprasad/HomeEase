function normalizePhone(value) {
  return String(value || '').replace(/\D/g, '');
}

function validateProfile(values = {}) {
  const errors = {};
  const name = String(values.name || '').trim();
  const phone = normalizePhone(values.phone);

  if (name.length < 2) {
    errors.name = 'Name must be at least 2 characters.';
  }
  if (!/^\d{10}$/.test(phone)) {
    errors.phone = 'Enter a valid 10 digit phone number.';
  }

  return errors;
}

function buildProfilePayload(values = {}) {
  return {
    name: String(values.name || '').trim(),
    phone: normalizePhone(values.phone),
    imageUrl: String(values.imageUrl || '').trim() || null,
  };
}

function validateAddress(values = {}) {
  const errors = {};
  const label = String(values.label || '').trim();
  const addressLine = String(values.addressLine || '').trim();
  const city = String(values.city || '').trim();
  const pincode = String(values.pincode || '').trim();

  if (!label) {
    errors.label = 'Address label is required.';
  }
  if (addressLine.length < 10) {
    errors.addressLine = 'Address must be at least 10 characters.';
  }
  if (!city) {
    errors.city = 'City is required.';
  }
  if (!/^\d{6}$/.test(pincode)) {
    errors.pincode = 'Enter a valid 6 digit pincode.';
  }

  return errors;
}

function buildAddressPayload(values = {}) {
  return {
    label: String(values.label || '').trim(),
    addressLine: String(values.addressLine || '').trim(),
    city: String(values.city || '').trim(),
    pincode: String(values.pincode || '').trim(),
    isDefault: Boolean(values.isDefault),
  };
}

function validatePassword(values = {}) {
  const errors = {};
  const currentPassword = String(values.currentPassword || '');
  const newPassword = String(values.newPassword || '');
  const confirmPassword = String(values.confirmPassword || '');

  if (!currentPassword) {
    errors.currentPassword = 'Current password is required.';
  }
  if (newPassword.length < 6) {
    errors.newPassword = 'New password must be at least 6 characters.';
  }
  if (newPassword && newPassword === currentPassword) {
    errors.newPassword = 'Choose a password different from the current one.';
  }
  if (newPassword !== confirmPassword) {
    errors.confirmPassword = 'Passwords must match.';
  }

  return errors;
}

function buildPasswordPayload(values = {}) {
  return {
    oldPassword: String(values.currentPassword || ''),
    newPassword: String(values.newPassword || ''),
  };
}

function addressToBookingText(address) {
  if (!address) return '';
  return [address.addressLine, address.city, address.pincode].filter(Boolean).join(', ');
}

module.exports = {
  addressToBookingText,
  buildAddressPayload,
  buildPasswordPayload,
  buildProfilePayload,
  validateAddress,
  validatePassword,
  validateProfile,
};
