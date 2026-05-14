import { useState, useCallback, useEffect } from 'react';
import toast from 'react-hot-toast';

// useApi
export const useApi = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const execute = useCallback(async (
    apiCall,
    { successMessage, errorMessage, onSuccess, onError } = {}
  ) => {
    setLoading(true);
    setError(null);

    try {
      const result = await apiCall();

      if (successMessage) toast.success(successMessage);
      if (onSuccess) onSuccess(result);

      return result;
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        errorMessage ||
        'Something went wrong';

      setError(msg);

      if (errorMessage !== false) toast.error(msg);
      if (onError) onError(err);

      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return { loading, error, execute };
};

// usePagination
export const usePagination = (initialPage = 1) => {
  const [page, setPage] = useState(initialPage);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
    }
  };

  return {
    page,
    setPage,
    totalPages,
    setTotalPages,
    total,
    setTotal,
    handlePageChange,
  };
};

// useDebounce
export const useDebounce = (value, delay = 400) => {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebounced(value);
    }, delay);

    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
};

// useModal
export const useModal = (initialState = false) => {
  const [isOpen, setIsOpen] = useState(initialState);
  const [data, setData] = useState(null);

  const open = useCallback((d = null) => {
    setData(d);
    setIsOpen(true);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);

    setTimeout(() => {
      setData(null);
    }, 300);
  }, []);

  return {
    isOpen,
    data,
    open,
    close,
  };
};