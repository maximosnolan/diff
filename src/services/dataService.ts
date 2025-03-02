// src/services/dataService.ts
// Hard-coded dataset of mock diff data
const DIFF_DATASET = {
  diffs: [
    {
      diffingId: "DIFF-1-TKTAPIAccessor-DEV-2023-01-01",
      pxnum: 999,
      environment: "DEV",
      service: "TKTAPIAccessor",
      sunJson: {
        id: 1,
        traderName: "John Doe",
        price: 99.75,
        location: "New York",
        counterpartyName: "ABC Corp",
        commission: 4.5,
        address: { city: "New York", zip: "10001" },
      },
      linuxJson: {
        id: 1,
        traderName: "John Doe",
        price: 100.50,
        location: "New York",
        counterpartyName: "ABC Corp",
        commission: 4.5,
        address: { city: "San Francisco", zip: "10001" },
      },
    },
    {
      diffingId: "DIFF-2-CUTSService-BETA-2023-02-01",
      pxnum: 102,
      environment: "BETA",
      service: "CUTSService",
      sunJson: {
        id: 1,
        traderName: "John Doe",
        price: 99.75,
        location: "New York",
        counterpartyName: "ABC Corp",
        commission: 4.5,
        address: { city: "New York", zip: "10001" },
      },
      linuxJson: {
        id: 1,
        traderName: "Modified Trader X",
        price: 99.75,
        location: "New York",
        counterpartyName: "ABC Corp",
        commission: 5.0,
        address: { city: "New York", zip: "10001" },
      },
    },
    {
      diffingId: "DIFF-3-cmmtsvc-UAT-2023-03-01",
      pxnum: 999,
      environment: "UAT",
      service: "cmmtsvc",
      sunJson: {
        id: 1,
        traderName: "Alice Smith",
        price: 105.50,
        location: "San Francisco",
        counterpartyName: "XYZ Corp",
        commission: 3.5,
        address: { city: "San Francisco", zip: "94105" },
      },
      linuxJson: {
        id: 1,
        traderName: "Alice Smith",
        price: 106.00,
        location: "San Francisco",
        counterpartyName: "XYZ Corp",
        commission: 3.5,
        address: { city: "San Jose", zip: "94105" },
      },
    },
    {
      diffingId: "DIFF-4-tssvcapi-PROD-2023-04-01",
      pxnum: 102,
      environment: "PROD",
      service: "tssvcapi",
      sunJson: {
        id: 1,
        traderName: "Bob Johnson",
        price: 150.25,
        location: "Chicago",
        counterpartyName: "DEF Corp",
        commission: 6.5,
        address: { city: "Chicago", zip: "60601" },
      },
      linuxJson: {
        id: 1,
        traderName: "Bob Johnson",
        price: 151.00,
        location: "Chicago",
        counterpartyName: "DEF Corp",
        commission: 6.5,
        address: { city: "Chicago", zip: "60601" },
      },
    },
    {
      diffingId: "DIFF-5-TKTAPIAccessor-DEV-2023-05-01",
      pxnum: 999,
      environment: "DEV",
      service: "TKTAPIAccessor",
      sunJson: {
        id: 1,
        traderName: "Charlie Brown",
        price: 101.00,
        location: "Boston",
        counterpartyName: "GHI Corp",
        commission: 2.5,
        address: { city: "Boston", zip: "02115" },
      },
      linuxJson: {
        id: 1,
        traderName: "Charlie Brown",
        price: 102.00,
        location: "Boston",
        counterpartyName: "GHI Corp",
        commission: 2.5,
        address: { city: "Boston", zip: "02115" },
      },
    },
    {
      diffingId: "DIFF-6-CUTSService-BETA-2023-06-01",
      pxnum: 102,
      environment: "BETA",
      service: "CUTSService",
      sunJson: {
        id: 1,
        traderName: "Diana Green",
        price: 120.50,
        location: "Los Angeles",
        counterpartyName: "JKL Corp",
        commission: 5.0,
        address: { city: "Los Angeles", zip: "90001" },
      },
      linuxJson: {
        id: 1,
        traderName: "Diana Green",
        price: 121.50,
        location: "Los Angeles",
        counterpartyName: "JKL Corp",
        commission: 5.0,
        address: { city: "Los Angeles", zip: "90001" },
      },
    },
  ],
  diffGroups: {
    "address.city,price": [
      {
        diffId: "DIFF-1-TKTAPIAccessor-DEV-2023-01-01",
        date: "2023-01-01",
        pxnum: 999,
        env: "DEV",
        serviceName: "TKTAPIAccessor", // Added serviceName
        json1: {
          id: 1,
          traderName: "John Doe",
          price: 99.75,
          location: "New York",
          counterpartyName: "ABC Corp",
          commission: 4.5,
          address: { city: "New York", zip: "10001" },
        },
        json2: {
          id: 1,
          traderName: "John Doe",
          price: 100.50,
          location: "New York",
          counterpartyName: "ABC Corp",
          commission: 4.5,
          address: { city: "San Francisco", zip: "10001" },
        },
      },
      {
        diffId: "DIFF-5-TKTAPIAccessor-DEV-2023-05-01",
        date: "2023-05-01",
        pxnum: 999,
        env: "DEV",
        serviceName: "TKTAPIAccessor", // Added serviceName
        json1: {
          id: 1,
          traderName: "Charlie Brown",
          price: 101.00,
          location: "Boston",
          counterpartyName: "GHI Corp",
          commission: 2.5,
          address: { city: "Boston", zip: "02115" },
        },
        json2: {
          id: 1,
          traderName: "Charlie Brown",
          price: 102.00,
          location: "Boston",
          counterpartyName: "GHI Corp",
          commission: 2.5,
          address: { city: "Boston", zip: "02115" },
        },
      },
    ],
    "traderName,commission": [
      {
        diffId: "DIFF-2-CUTSService-BETA-2023-02-01",
        date: "2023-02-01",
        pxnum: 102,
        env: "BETA",
        serviceName: "CUTSService", // Added serviceName
        json1: {
          id: 1,
          traderName: "John Doe",
          price: 99.75,
          location: "New York",
          counterpartyName: "ABC Corp",
          commission: 4.5,
          address: { city: "New York", zip: "10001" },
        },
        json2: {
          id: 1,
          traderName: "Modified Trader X",
          price: 99.75,
          location: "New York",
          counterpartyName: "ABC Corp",
          commission: 5.0,
          address: { city: "New York", zip: "10001" },
        },
      },
      {
        diffId: "DIFF-6-CUTSService-BETA-2023-06-01",
        date: "2023-06-01",
        pxnum: 102,
        env: "BETA",
        serviceName: "CUTSService", // Added serviceName
        json1: {
          id: 1,
          traderName: "Diana Green",
          price: 120.50,
          location: "Los Angeles",
          counterpartyName: "JKL Corp",
          commission: 5.0,
          address: { city: "Los Angeles", zip: "90001" },
        },
        json2: {
          id: 1,
          traderName: "Diana Green",
          price: 121.50,
          location: "Los Angeles",
          counterpartyName: "JKL Corp",
          commission: 5.0,
          address: { city: "Los Angeles", zip: "90001" },
        },
      },
    ],
    "address.city,price,": [
      {
        diffId: "DIFF-3-cmmtsvc-UAT-2023-03-01",
        date: "2023-03-01",
        pxnum: 999,
        env: "UAT",
        serviceName: "cmmtsvc", // Added serviceName
        json1: {
          id: 1,
          traderName: "Alice Smith",
          price: 105.50,
          location: "San Francisco",
          counterpartyName: "XYZ Corp",
          commission: 3.5,
          address: { city: "San Francisco", zip: "94105" },
        },
        json2: {
          id: 1,
          traderName: "Alice Smith",
          price: 106.00,
          location: "San Francisco",
          counterpartyName: "XYZ Corp",
          commission: 3.5,
          address: { city: "San Jose", zip: "94105" },
        },
      },
    ],
  },
};



  
  export const fetchDiffData = (diffingId: string, pxnum: number, environment: string, service: string) => {
    const diff = DIFF_DATASET.diffs.find(
      (d) =>
        d.diffingId === diffingId &&
        d.pxnum === pxnum &&
        d.environment === environment &&
        d.service === service
    );
  
    if (diff) {
      return {
        sunJson: diff.sunJson,
        linuxJson: diff.linuxJson,
      };
    }
  
    return null;
  };

  /*
  
  ACCESSOR FOR DATA. HERE IS WILL WE WILL MAKE CALLS TO UNDERLYING BAS SERVICE FOR NOW THIS RETURNS MOCK DATA
  
  */
  
  export const fetchDiffGroups = (service: string, environment: string, startDate: string, endDate: string) => {
    console.log("FETCH GROUPS", service, environment, startDate, endDate);
    const filteredGroups: Record<string, { diffId: string; date: string; pxnum: number; env: string; json1: any; json2: any }[]> = {};
    for (const [groupKey, diffs] of Object.entries(DIFF_DATASET.diffGroups)) {
      console.log("DIFFS", diffs)
      const matchingDiffs = diffs.filter((diff) => {
        console.log(diff);
        console.log(diff.diffId.includes(service));
        return (
          diff.serviceName === service &&
          diff.env === environment &&
          diff.date >= startDate &&
          diff.date <= endDate
        );
      });
      if (matchingDiffs.length > 0) {
        filteredGroups[groupKey] = matchingDiffs;
      }
    }
    return filteredGroups;
  };

  export const fetchServicesToDiff = () => {   
    // TODO: query TSLOGDB
    return ["TKTAPIAccessor", "CUTSService", "cmmtsvc", "tssvcapi"];
  }

  export const fetchEnvironmentsToDiff = () => {   
        return ["DEV", "BETA", "UAT", "PROD"];
  }

  export const fetchHumioLink = (environment: string, diffId: string, serviceName: string) => {
        return "humio" + environment + diffId + serviceName;
  }