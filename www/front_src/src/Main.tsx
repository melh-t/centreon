import * as React from 'react';

import { isNil, not, pathEq } from 'ramda';
import { useNavigate, Routes, Route } from 'react-router-dom';
import { useUpdateAtom } from 'jotai/utils';

import { Typography } from '@material-ui/core';

import { getData, useRequest } from '@centreon/ui';
import { User, userAtom } from '@centreon/ui-context';

import Provider from './Provider';
import { userDecoder, webVersionsDecoder } from './api/decoders';
import { userEndpoint, webVersionsEndpoint } from './api/endpoint';
import reactRoutes from './reactRoutes/routeMap';
import { WebVersions } from './api/models';

const App = React.lazy(() => import('./App'));
const LoginPage = React.lazy(() => import('./Login'));

const Main = (): JSX.Element => {
  const [webVersions, setWebVersions] = React.useState<WebVersions | null>(
    null,
  );
  const [areTranslationsLoaded, setAreTranslationsLoaded] =
    React.useState(false);

  const navigate = useNavigate();
  const { sendRequest: getUser } = useRequest<User>({
    decoder: userDecoder,
    request: getData,
  });
  const { sendRequest: getWebVersions, sending: sendingWebVersions } =
    useRequest<WebVersions>({
      decoder: webVersionsDecoder,
      request: getData,
    });

  const setUser = useUpdateAtom(userAtom);

  const changeAreTranslationsLoaded = (loaded): void => {
    setAreTranslationsLoaded(loaded);
  };

  const loadUser = (): Promise<void | User> =>
    getUser({
      endpoint: userEndpoint,
    }).catch((error) => {
      if (pathEq(['response', 'status'], 401)(error)) {
        navigate(reactRoutes.login);
      }
    });

  React.useEffect(() => {
    Promise.all([
      getWebVersions({
        endpoint: webVersionsEndpoint,
      }),
      loadUser(),
    ]).then(([retrievedWebVersions, retrievedUser]) => {
      setWebVersions(retrievedWebVersions);

      if (isNil(retrievedUser)) {
        return;
      }

      const user = retrievedUser as User;

      setUser({
        alias: user.alias,
        isExportButtonEnabled: user.isExportButtonEnabled,
        locale: user.locale || 'en',
        name: user.name,
        timezone: user.timezone,
        use_deprecated_pages: user.use_deprecated_pages,
      });
    });
  }, []);

  React.useEffect(() => {
    if (isNil(webVersions)) {
      return;
    }

    if (isNil(webVersions.installedVersion)) {
      navigate(reactRoutes.install);

      return;
    }

    if (not(isNil(webVersions.availableVersion))) {
      navigate(reactRoutes.upgrade);
    }
  }, [webVersions]);

  if (sendingWebVersions || isNil(webVersions)) {
    return <Typography>Loading...</Typography>;
  }

  return (
    <React.Suspense fallback={<Typography>sdhssddsisdsdssds</Typography>}>
      <App
        areTranslationsLoaded={areTranslationsLoaded}
        changeAreTranslationsLoaded={changeAreTranslationsLoaded}
      />
    </React.Suspense>
  );
};

export default (): JSX.Element => (
  <Provider>
    <Routes>
      <Route element={<LoginPage />} path={reactRoutes.login} />
      <Route element={<Main />} path="*" />
    </Routes>
  </Provider>
);
