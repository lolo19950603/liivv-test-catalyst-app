import { expect, test } from '~/tests/fixtures';
import { getTranslations } from '~/tests/lib/i18n';

test.use({ reuseCustomerSession: false });

test('Login and logout flows work as expected', async ({ page, customer }) => {
  const t = await getTranslations();

  await customer.login();
  await page.waitForURL('/account/dashboard/');
  await expect(
    page.getByText(t('Account.Dashboard.wellness.welcomeLead')),
  ).toBeVisible();

  await customer.logout();
  await expect(page.getByRole('heading', { name: t('Auth.Login.heading') })).toBeVisible();
});

test('Login with redirectTo query parameter works with a simple path', async ({
  page,
  customer,
}) => {
  const redirectTo = '/test-path/';

  await customer.login(redirectTo);
  await page.waitForURL(redirectTo);
});

test('Login with redirectTo query parameter works with a path containing query parameters', async ({
  page,
  customer,
}) => {
  const redirectTo = '/test-path/?param1=value1&param2=value2';

  await customer.login(redirectTo);
  await page.waitForURL(redirectTo);
});

test('Login with invalid credentials returns an error', async ({ page }) => {
  const t = await getTranslations('Auth.Login');

  await page.goto(`/login`);
  await page.getByLabel(t('email')).fill('invalid-email-testing@testing.com');
  await page.getByLabel(t('password')).fill('invalid-password');
  await page.getByRole('button', { name: t('cta') }).click();

  await expect(page.getByText(t('invalidCredentials'))).toBeVisible();
});

test('Browsing to /login/ when already logged in redirects to /account/dashboard/', async ({
  page,
  customer,
}) => {
  const t = await getTranslations();

  await customer.login();
  await page.waitForURL('/account/dashboard/');
  await expect(page.getByText(t('Account.Dashboard.wellness.welcomeLead'))).toBeVisible();

  await page.goto('/login/');
  await page.waitForURL('/account/dashboard/');
  await expect(page.getByText(t('Account.Dashboard.wellness.welcomeLead'))).toBeVisible();
});

test('JWT login works as expected and redirects to /account/dashboard/ by default', async ({
  page,
  customer,
}) => {
  const t = await getTranslations('Account.Dashboard');
  const { id } = await customer.getOrCreateTestCustomer();
  const jwt = await customer.generateLoginJwt(id);

  await page.goto(`/login/token/${jwt}`);
  await page.waitForURL('/account/dashboard/');
  await expect(page.getByText(t('wellness.welcomeLead'))).toBeVisible();
});

test('JWT login redirects to the specified redirect_to value in the token payload', async ({
  page,
  customer,
}) => {
  const t = await getTranslations('Account.Addresses');
  const { id } = await customer.getOrCreateTestCustomer();
  const jwt = await customer.generateLoginJwt(id, '/account/addresses/');

  await page.goto(`/login/token/${jwt}`);
  await page.waitForURL(/\/account\/settings/);
  await expect(page.getByRole('heading', { name: t('title'), exact: true })).toBeVisible();
});

test('JWT login with an invalid/expired token shows an error message', async ({ page }) => {
  const t = await getTranslations('Auth.Login');

  const invalidJwt =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';

  await page.goto(`/login/token/${invalidJwt}`);
  await page.waitForURL('/login/?error=InvalidToken');
  await expect(page.getByText(t('invalidToken'))).toBeVisible();
});

test('After invalid JWT login, manually logging in with invalid credentials will replace the error message displayed', async ({
  page,
}) => {
  const t = await getTranslations('Auth.Login');

  const invalidJwt =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';

  await page.goto(`/login/token/${invalidJwt}`);
  await page.waitForURL('/login/?error=InvalidToken');
  await expect(page.getByText(t('invalidToken'))).toBeVisible();

  await page.getByLabel(t('email')).fill('invalid-email-testing@testing.com');
  await page.getByLabel(t('password')).fill('invalid-password');
  await page.getByRole('button', { name: t('cta') }).click();

  await page.waitForURL('/login/');
  await expect(page.getByText(t('invalidToken'))).not.toBeVisible();
  await expect(page.getByText(t('invalidCredentials'))).toBeVisible();
});
