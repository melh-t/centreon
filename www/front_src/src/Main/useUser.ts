import { useAtom, atom } from 'jotai';
import { useUpdateAtom } from 'jotai/utils';
import { isNil, pathEq } from 'ramda';

import { User, userAtom } from '@centreon/ui-context';
import { useRequest, getData } from '@centreon/ui';

import { userDecoder } from '../api/decoders';
import { userEndpoint } from '../api/endpoint';

export const areUserParametersLoadedAtom = atom<boolean | null>(null);

const useUser = (
  changeLanguage: (locale: string) => void,
): (() => null | Promise<void>) => {
  const { sendRequest: getUser } = useRequest<User>({
    decoder: userDecoder,
    request: getData,
    showErrorOnPermissionDenied: false,
  });

  const [areUserParametersLoaded, setAreUserParametersLoaded] = useAtom(
    areUserParametersLoadedAtom,
  );
  const setUser = useUpdateAtom(userAtom);

  const loadUser = (): null | Promise<void> => {
    if (areUserParametersLoaded) {
      return null;
    }

    return getUser({
      endpoint: userEndpoint,
    })
      .then((retrievedUser) => {
        if (isNil(retrievedUser)) {
          return;
        }

        const {
          alias,
          isExportButtonEnabled,
          locale,
          name,
          timezone,
          use_deprecated_pages: useDeprecatedPages,
        } = retrievedUser as User;

        setUser({
          alias,
          isExportButtonEnabled,
          locale: locale || 'en',
          name,
          timezone,
          use_deprecated_pages: useDeprecatedPages,
        });
        changeLanguage((retrievedUser as User).locale);
        setAreUserParametersLoaded(true);
      })
      .catch((error) => {
        if (
          pathEq(['response', 'status'], 403)(error) ||
          pathEq(['response', 'status'], 401)(error)
        ) {
          setAreUserParametersLoaded(false);
        }
      });
  };

  return loadUser;
};

export default useUser;
