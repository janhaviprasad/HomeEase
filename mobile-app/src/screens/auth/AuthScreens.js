import { useCallback, useEffect, useMemo, useState } from 'react';
import { authService } from '../../api/auth';
import { servicesService } from '../../api/services';
import { useAuth } from '../../context';
import {
  digitsOnly,
  mapLoginError,
  mapOtpError,
  mapRegistrationError,
  runCustomerRegistrationSubmission,
  runForgotPasswordSubmission,
  runLoginSubmission,
  runProviderRegistrationSubmission,
  runResendOtpSubmission,
  runVerifyOtpSubmission,
} from '../../utils/authForms';
import {
  CustomerRegisterScreenPreview,
  ForgotPasswordScreenPreview,
  LoginScreenPreview,
  ProviderRegisterScreenPreview,
  VerifyOtpScreenPreview,
  WelcomeScreenPreview,
} from '../preview/Cycle1PreviewScreens';

const RESEND_COOLDOWN_SECONDS = 30;

const SCREEN_PROPS = {
  showPreviewChrome: false,
};

const emptyLoginValues = {
  email: '',
  password: '',
};

const emptyRegisterValues = {
  fullName: '',
  email: '',
  phone: '',
  password: '',
  confirmPassword: '',
};

const emptyProviderValues = {
  ...emptyRegisterValues,
  categoryId: null,
  experience: '',
};

function normalizeCategoryList(result) {
  const list = Array.isArray(result) ? result : result?.services || result?.categories || [];
  const categoriesById = new Map();

  list.forEach((service) => {
    const id = Number(service.categoryId || service.id);
    if (!id || categoriesById.has(id)) {
      return;
    }

    categoriesById.set(id, {
      id,
      name: service.categoryName || service.name || service.description || `Category ${id}`,
    });
  });

  return Array.from(categoriesById.values());
}

export function WelcomeScreen({ navigation }) {
  return (
    <WelcomeScreenPreview
      {...SCREEN_PROPS}
      onCustomer={() => navigation.navigate('Login', { role: 'CUSTOMER' })}
      onLogin={() => navigation.navigate('Login')}
      onProvider={() => navigation.navigate('Login', { role: 'PROVIDER' })}
    />
  );
}

export function LoginScreen({ navigation, route }) {
  const { completeAuthentication } = useAuth();
  const selectedRole = route?.params?.role;
  const [values, setValues] = useState(emptyLoginValues);
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = useCallback((field, value) => {
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
    setFormError(null);
  }, []);

  const handleSubmit = useCallback(async () => {
    if (loading) {
      return;
    }

    setLoading(true);
    setFormError(null);

    try {
      const result = await runLoginSubmission({
        authService,
        completeAuthentication,
        isSubmitting: false,
        values,
      });

      if (result.errors) {
        setErrors(result.errors);
      }
    } catch (error) {
      setFormError(mapLoginError(error));
    } finally {
      setLoading(false);
    }
  }, [completeAuthentication, loading, values]);

  return (
    <LoginScreenPreview
      {...SCREEN_PROPS}
      errors={errors}
      formError={formError}
      loading={loading}
      onChange={handleChange}
      onForgotPassword={() => navigation.navigate('ForgotPassword')}
      onRegister={() => {
        if (selectedRole === 'CUSTOMER') {
          navigation.navigate('CustomerRegister');
          return;
        }

        if (selectedRole === 'PROVIDER') {
          navigation.navigate('ProviderRegister');
          return;
        }

        navigation.navigate('Welcome');
      }}
      onSubmit={handleSubmit}
      values={values}
    />
  );
}

export function ForgotPasswordScreen({ navigation }) {
  const [values, setValues] = useState({ email: '' });
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = useCallback((field, value) => {
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
    setFormError(null);
    setSuccessMessage(null);
  }, []);

  const handleSubmit = useCallback(async () => {
    if (loading) {
      return;
    }

    setLoading(true);
    setFormError(null);
    setSuccessMessage(null);

    try {
      const result = await runForgotPasswordSubmission({
        authService,
        isSubmitting: false,
        values,
      });

      if (result.errors) {
        setErrors(result.errors);
      }

      if (result.message) {
        setSuccessMessage(result.message);
      }
    } catch (error) {
      setFormError(mapRegistrationError(error));
    } finally {
      setLoading(false);
    }
  }, [loading, values]);

  return (
    <ForgotPasswordScreenPreview
      {...SCREEN_PROPS}
      errors={errors}
      formError={formError}
      loading={loading}
      onBack={() => navigation.navigate('Login')}
      onChange={handleChange}
      onSubmit={handleSubmit}
      successMessage={successMessage}
      values={values}
    />
  );
}

export function CustomerRegisterScreen({ navigation }) {
  const [values, setValues] = useState(emptyRegisterValues);
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = useCallback((field, value) => {
    const nextValue = field === 'phone' ? digitsOnly(value) : value;
    setValues((current) => ({ ...current, [field]: nextValue }));
    setErrors((current) => ({ ...current, [field]: undefined }));
    setFormError(null);
  }, []);

  const handleSubmit = useCallback(async () => {
    if (loading) {
      return;
    }

    setLoading(true);
    setFormError(null);

    try {
      const result = await runCustomerRegistrationSubmission({
        authService,
        isSubmitting: false,
        values,
      });

      if (result.errors) {
        setErrors(result.errors);
      }

      // The account does not exist yet; it is created once the code is verified.
      if (result.otpRequired) {
        navigation.navigate('VerifyOtp', { email: result.email });
      }
    } catch (error) {
      setFormError(mapRegistrationError(error));
    } finally {
      setLoading(false);
    }
  }, [loading, navigation, values]);

  return (
    <CustomerRegisterScreenPreview
      {...SCREEN_PROPS}
      errors={errors}
      formError={formError}
      loading={loading}
      onChange={handleChange}
      onLogin={() => navigation.navigate('Login', { role: 'CUSTOMER' })}
      onSubmit={handleSubmit}
      values={values}
    />
  );
}

export function VerifyOtpScreen({ navigation, route }) {
  const { completeAuthentication } = useAuth();
  const email = route.params?.email || '';
  const [values, setValues] = useState({ code: '' });
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  // register already sent a code, so the cooldown starts spent.
  const [resendCooldown, setResendCooldown] = useState(RESEND_COOLDOWN_SECONDS);

  useEffect(() => {
    if (resendCooldown <= 0) {
      return undefined;
    }

    const timer = setTimeout(() => setResendCooldown((current) => current - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  const handleChange = useCallback((field, value) => {
    setValues((current) => ({ ...current, [field]: digitsOnly(value) }));
    setErrors((current) => ({ ...current, [field]: undefined }));
    setFormError(null);
    setSuccessMessage(null);
  }, []);

  const handleSubmit = useCallback(async () => {
    if (loading) {
      return;
    }

    setLoading(true);
    setFormError(null);
    setSuccessMessage(null);

    try {
      // No navigation on success: completeAuthentication flips isAuthenticated
      // and RoleNavigator swaps the auth stack for the app, same as login.
      const result = await runVerifyOtpSubmission({
        authService,
        completeAuthentication,
        isSubmitting: false,
        values: { ...values, email },
      });

      if (result.errors) {
        setErrors(result.errors);
      }
    } catch (error) {
      setFormError(mapOtpError(error));
    } finally {
      setLoading(false);
    }
  }, [completeAuthentication, email, loading, values]);

  const handleResend = useCallback(async () => {
    if (resendLoading || resendCooldown > 0) {
      return;
    }

    setResendLoading(true);
    setFormError(null);
    setSuccessMessage(null);

    try {
      const result = await runResendOtpSubmission({
        authService,
        isSubmitting: false,
        values: { email },
      });

      setSuccessMessage(result.message);
      setValues({ code: '' });
      setErrors({});
      setResendCooldown(RESEND_COOLDOWN_SECONDS);
    } catch (error) {
      setFormError(mapOtpError(error));
    } finally {
      setResendLoading(false);
    }
  }, [email, resendCooldown, resendLoading]);

  return (
    <VerifyOtpScreenPreview
      {...SCREEN_PROPS}
      errors={errors}
      formError={formError}
      loading={loading}
      onBack={() => navigation.goBack()}
      onChange={handleChange}
      onResend={handleResend}
      onSubmit={handleSubmit}
      resendCooldown={resendCooldown}
      resendLoading={resendLoading}
      successMessage={successMessage}
      values={{ ...values, email }}
    />
  );
}

export function ProviderRegisterScreen({ navigation }) {
  const [values, setValues] = useState(emptyProviderValues);
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [categoryLoading, setCategoryLoading] = useState(true);
  const [categoryError, setCategoryError] = useState(null);

  const loadCategories = useCallback(async () => {
    setCategoryLoading(true);
    setCategoryError(null);

    try {
      const result = await servicesService.list();
      setCategories(normalizeCategoryList(result));
    } catch (error) {
      setCategoryError(mapRegistrationError(error, { category: true }));
    } finally {
      setCategoryLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  const handleChange = useCallback((field, value) => {
    let nextValue = value;
    if (field === 'phone') {
      nextValue = digitsOnly(value);
    }
    if (field === 'categoryId') {
      nextValue = Number(value);
    }

    setValues((current) => ({ ...current, [field]: nextValue }));
    setErrors((current) => ({ ...current, [field]: undefined }));
    setFormError(null);
  }, []);

  const handleSubmit = useCallback(async () => {
    if (loading) {
      return;
    }

    setLoading(true);
    setFormError(null);

    try {
      const result = await runProviderRegistrationSubmission({
        authService,
        isSubmitting: false,
        values,
      });

      if (result.errors) {
        setErrors(result.errors);
      }

      // Both the user and provider rows are created by verify-otp, not here.
      if (result.otpRequired) {
        navigation.navigate('VerifyOtp', { email: result.email });
      }
    } catch (error) {
      setFormError(mapRegistrationError(error, { category: Boolean(values.categoryId) }));
    } finally {
      setLoading(false);
    }
  }, [loading, navigation, values]);

  const visibleCategories = useMemo(() => categories, [categories]);

  return (
    <ProviderRegisterScreenPreview
      {...SCREEN_PROPS}
      categories={visibleCategories}
      categoryError={categoryError}
      categoryLoading={categoryLoading}
      errors={errors}
      formError={formError}
      loading={loading}
      onCategoryRetry={loadCategories}
      onChange={handleChange}
      onLogin={() => navigation.navigate('Login', { role: 'PROVIDER' })}
      onSubmit={handleSubmit}
      values={values}
    />
  );
}
