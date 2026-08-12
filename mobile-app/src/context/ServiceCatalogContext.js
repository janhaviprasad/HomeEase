import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { servicesService } from '../api/services';
import {
  adaptServiceCollection,
  findServiceById,
  mapServiceError,
} from '../utils/serviceCatalog';

const ServiceCatalogContext = createContext({
  services: [],
  loading: false,
  refreshing: false,
  error: null,
  refresh: async () => [],
  getServiceById: () => null,
});

export function ServiceCatalogProvider({ autoLoad = true, children }) {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const requestRef = useRef(null);

  const loadCatalogue = useCallback(async ({ refresh = false } = {}) => {
    if (requestRef.current) {
      return requestRef.current;
    }

    if (refresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setError(null);

    requestRef.current = (async () => {
      const result = await servicesService.list();
      const nextServices = adaptServiceCollection(result);
      setServices(nextServices);
      return nextServices;
    })();

    try {
      return await requestRef.current;
    } catch (nextError) {
      setError(mapServiceError(nextError));
      throw nextError;
    } finally {
      requestRef.current = null;
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    if (autoLoad) {
      loadCatalogue().catch(() => {});
    }
  }, [autoLoad, loadCatalogue]);

  const refresh = useCallback(() => loadCatalogue({ refresh: services.length > 0 }), [loadCatalogue, services.length]);

  const getServiceById = useCallback(
    (id) => findServiceById(services, id),
    [services]
  );

  const value = useMemo(
    () => ({
      services,
      loading,
      refreshing,
      error,
      refresh,
      getServiceById,
    }),
    [error, getServiceById, loading, refresh, refreshing, services]
  );

  return (
    <ServiceCatalogContext.Provider value={value}>
      {children}
    </ServiceCatalogContext.Provider>
  );
}

export function useServiceCatalog() {
  return useContext(ServiceCatalogContext);
}

export default ServiceCatalogContext;
