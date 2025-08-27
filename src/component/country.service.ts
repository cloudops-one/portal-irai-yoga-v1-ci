import { useMemo } from "react";
import { API_URLS } from "../common/App.const";
import { useApi } from "../common/App.service";
export interface CountrySetting {
  countryCode: string;
  countryName: string;
  mobileCountryCode: string;
  currencyCode: string;
  currencyName: string;
  currencySymbol: string;
}
export interface CountryOption {
  code: string;
  label: string;
  phone: string;
}

export interface CurrencyOption {
  code: string;
  name: string;
  symbol: string;
}

export function useCountryCurrencySettings() {
  const {
    data,
    isPending: loading,
    error,
    refetch,
  } = useApi<{ data: { settingValue: CountrySetting[] } }>({
    url: `${API_URLS.SETTING}/COUNTRY`,
  });

  // Memoize countries and currencies for performance
  const { countries, currencies } = useMemo(() => {
    const settingValues = data?.data?.settingValue || [];
    const countryOptions: CountryOption[] = settingValues.map((item) => ({
      code: item.countryCode,
      label: item.countryName,
      phone: item.mobileCountryCode,
    }));

    const currencyMap = new Map<string, CurrencyOption>();
    settingValues.forEach((item) => {
      currencyMap.set(item.currencyCode, {
        code: item.currencyCode,
        name: item.currencyName,
        symbol: item.currencySymbol,
      });
    });

    return {
      countries: countryOptions,
      currencies: Array.from(currencyMap.values()),
    };
  }, [data]);

  return {
    countries,
    currencies,
    loading,
    error,
    refetch,
  };
}
