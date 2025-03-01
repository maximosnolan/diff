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
        diffingId: "DIFF-1-CUTSService-BETA-2023-02-01",
        pxnum: 888,
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
    ],
    diffGroups: {
      "address.city,price": [
        {
          diffId: "DIFF-1-TKTAPIAccessor-DEV-2023-01-01",
          date: "2023-01-01",
          pxnum: 999,
          env: "DEV",
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
      ],
      "traderName,commission": [
        {
          diffId: "DIFF-1-CUTSService-BETA-2023-02-01",
          date: "2023-02-01",
          pxnum: 888,
          env: "BETA",
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
    console.log("FETCH GROUPS");
    const filteredGroups: Record<string, { diffId: string; date: string; pxnum: number; env: string; json1: any; json2: any }[]> = {};
    for (const [groupKey, diffs] of Object.entries(DIFF_DATASET.diffGroups)) {
      const matchingDiffs = diffs.filter((diff) => {
        return (
          diff.diffId.includes(service) &&
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