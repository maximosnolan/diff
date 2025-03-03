// src/services/dataService.ts

// Hard-coded dataset of mock diff data with added serviceName, date, and apiName fields
export const MOCK_API_DATA = {
  TKTAPIAccessor: [
    { apiName: "TradeAPI", diffingId: "DIFF-1-TKTAPIAccessor-DEV-2023-01-01", environment: "DEV", date: "2023-01-01", differences: 2 },
    { apiName: "TradeAPI", diffingId: "DIFF-5-TKTAPIAccessor-DEV-2023-05-01", environment: "DEV", date: "2023-05-01", differences: 1 },
    { apiName: "UserAPI", diffingId: "DIFF-7-TKTAPIAccessor-DEV-2023-07-01", environment: "DEV", date: "2023-07-01", differences: 1 },
  ],
  CUTSService: [
    { apiName: "CutAPI", diffingId: "DIFF-2-CUTSService-BETA-2023-02-01", environment: "BETA", date: "2023-02-01", differences: 2 },
    { apiName: "CutAPI", diffingId: "DIFF-6-CUTSService-BETA-2023-06-01", environment: "BETA", date: "2023-06-01", differences: 1 },
  ],
  cmmtsvc: [
    { apiName: "CommentAPI", diffingId: "DIFF-3-cmmtsvc-UAT-2023-03-01", environment: "UAT", date: "2023-03-01", differences: 2 },
  ],
  tssvcapi: [
    { apiName: "TSAPI", diffingId: "DIFF-4-tssvcapi-PROD-2023-04-01", environment: "PROD", date: "2023-04-01", differences: 0 }, // No differences for completed status
  ],
};

const DIFF_DATASET = {
  diffs: [
    {
      diffingId: "DIFF-1-TKTAPIAccessor-DEV-2023-01-01",
      pxnum: 999,
      environment: "DEV",
      service: "TKTAPIAccessor",
      serviceName: "TKTAPIAccessor",
      apiName: "TradeAPI",
      date: "2023-01-01",
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
        price: 100.5,
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
      serviceName: "CUTSService",
      apiName: "CutAPI",
      date: "2023-02-01",
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
      serviceName: "cmmtsvc",
      apiName: "CommentAPI",
      date: "2023-03-01",
      sunJson: {
        id: 1,
        traderName: "Alice Smith",
        price: 105.5,
        location: "San Francisco",
        counterpartyName: "XYZ Corp",
        commission: 3.5,
        address: { city: "San Francisco", zip: "94105" },
      },
      linuxJson: {
        id: 1,
        traderName: "Alice Smith",
        price: 106.0,
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
      serviceName: "tssvcapi",
      apiName: "TSAPI",
      date: "2023-04-01",
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
        price: 151.0,
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
      serviceName: "TKTAPIAccessor",
      apiName: "TradeAPI",
      date: "2023-05-01",
      sunJson: {
        id: 1,
        traderName: "Charlie Brown",
        price: 101.0,
        location: "Boston",
        counterpartyName: "GHI Corp",
        commission: 2.5,
        address: { city: "Boston", zip: "02115" },
      },
      linuxJson: {
        id: 1,
        traderName: "Charlie Brown",
        price: 102.0,
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
      serviceName: "CUTSService",
      apiName: "CutAPI",
      date: "2023-06-01",
      sunJson: {
        id: 1,
        traderName: "Diana Green",
        price: 120.5,
        location: "Los Angeles",
        counterpartyName: "JKL Corp",
        commission: 5.0,
        address: { city: "Los Angeles", zip: "90001" },
      },
      linuxJson: {
        id: 1,
        traderName: "Diana Green",
        price: 121.5,
        location: "Los Angeles",
        counterpartyName: "JKL Corp",
        commission: 5.0,
        address: { city: "Los Angeles", zip: "90001" },
      },
    },
    {
      diffingId: "DIFF-7-TKTAPIAccessor-DEV-2023-07-01",
      pxnum: 999,
      environment: "DEV",
      service: "TKTAPIAccessor",
      serviceName: "TKTAPIAccessor",
      apiName: "UserAPI",
      date: "2023-07-01",
      sunJson: {
        id: 1,
        traderName: "Eve Wilson",
        price: 110.0,
        location: "Seattle",
        counterpartyName: "MNO Corp",
        commission: 3.0,
        address: { city: "Seattle", zip: "98101" },
      },
      linuxJson: {
        id: 1,
        traderName: "Eve Wilson",
        price: 111.0,
        location: "Seattle",
        counterpartyName: "MNO Corp",
        commission: 3.0,
        address: { city: "Seattle", zip: "98101" },
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
        serviceName: "TKTAPIAccessor",
        apiName: "TradeAPI",
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
          price: 100.5,
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
        serviceName: "TKTAPIAccessor",
        apiName: "TradeAPI",
        json1: {
          id: 1,
          traderName: "Charlie Brown",
          price: 101.0,
          location: "Boston",
          counterpartyName: "GHI Corp",
          commission: 2.5,
          address: { city: "Boston", zip: "02115" },
        },
        json2: {
          id: 1,
          traderName: "Charlie Brown",
          price: 102.0,
          location: "Boston",
          counterpartyName: "GHI Corp",
          commission: 2.5,
          address: { city: "Boston", zip: "02115" },
        },
      },
      {
        diffId: "DIFF-7-TKTAPIAccessor-DEV-2023-07-01",
        date: "2023-07-01",
        pxnum: 999,
        env: "DEV",
        serviceName: "TKTAPIAccessor",
        apiName: "UserAPI",
        json1: {
          id: 1,
          traderName: "Eve Wilson",
          price: 110.0,
          location: "Seattle",
          counterpartyName: "MNO Corp",
          commission: 3.0,
          address: { city: "Seattle", zip: "98101" },
        },
        json2: {
          id: 1,
          traderName: "Eve Wilson",
          price: 111.0,
          location: "Seattle",
          counterpartyName: "MNO Corp",
          commission: 3.0,
          address: { city: "Seattle", zip: "98101" },
        },
      },
    ],
    "traderName,commission": [
      {
        diffId: "DIFF-2-CUTSService-BETA-2023-02-01",
        date: "2023-02-01",
        pxnum: 102,
        env: "BETA",
        serviceName: "CUTSService",
        apiName: "CutAPI",
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
        serviceName: "CUTSService",
        apiName: "CutAPI",
        json1: {
          id: 1,
          traderName: "Diana Green",
          price: 120.5,
          location: "Los Angeles",
          counterpartyName: "JKL Corp",
          commission: 5.0,
          address: { city: "Los Angeles", zip: "90001" },
        },
        json2: {
          id: 1,
          traderName: "Diana Green",
          price: 121.5,
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
        serviceName: "cmmtsvc",
        apiName: "CommentAPI",
        json1: {
          id: 1,
          traderName: "Alice Smith",
          price: 105.5,
          location: "San Francisco",
          counterpartyName: "XYZ Corp",
          commission: 3.5,
          address: { city: "San Francisco", zip: "94105" },
        },
        json2: {
          id: 1,
          traderName: "Alice Smith",
          price: 106.0,
          location: "San Francisco",
          counterpartyName: "XYZ Corp",
          commission: 3.5,
          address: { city: "San Jose", zip: "94105" },
        },
      },
    ],
  },
};

/*
  
ACCESSOR FOR DATA. HERE IS WHERE WE WILL MAKE CALLS TO UNDERLYING BAS SERVICE; FOR NOW, THIS RETURNS MOCK DATA
  
*/

export async function fetchDiffGroups(
  service: string,
  environment: string,
  startDate: string,
  endDate: string
): Promise<Record<string, { diffId: string; json1: any; json2: any; apiName: string }[]>> {
  const diffs = DIFF_DATASET.diffs.filter((diff) => {
    const diffDate = new Date(diff.date);
    const start = new Date(startDate);
    const end = new Date(endDate);
    console.log("Filtering diff:", diff, "with service:", service, "environment:", environment, "dates:", { diffDate, start, end });
    return (
      diff.service.toLowerCase() === service.toLowerCase() &&
      diff.environment.toLowerCase() === environment.toLowerCase() &&
      !isNaN(diffDate.getTime()) &&
      !isNaN(start.getTime()) &&
      !isNaN(end.getTime()) &&
      diffDate >= start &&
      diffDate <= end
    );
  });

  console.log("Filtered diffs for grouping:", diffs);

  if (diffs.length === 0) {
    console.warn("No diffs found for the given criteria");
    return {};
  }

  const groups: Record<string, { diffId: string; json1: any; json2: any; apiName: string }[]> = {};

  diffs.forEach((diff) => {
    const differences = getDifferentFields(diff.sunJson, diff.linuxJson)
      .sort()
      .join(",");

    if (differences) {
      if (!groups[differences]) {
        groups[differences] = [];
      }
      groups[differences].push({
        diffId: diff.diffingId,
        json1: diff.sunJson,
        json2: diff.linuxJson,
        apiName: diff.apiName,
      });
    } else {
      console.warn(`No differences found for diffId: ${diff.diffId}, skipping grouping`);
    }
  });

  console.log("Grouped diffs:", groups);
  return groups;
}

// Helper function to match DiffSelectionPage's getDifferentFields
function getDifferentFields(json1: any, json2: any): string[] {
  const diffs = [];
  const keys1 = Object.keys(json1);
  const keys2 = Object.keys(json2);

  for (const key of keys1) {
    if (!(key in json2)) {
      diffs.push(key);
    } else if (typeof json1[key] !== "object" || json1[key] === null) {
      if (typeof json1[key] === "number" && typeof json2[key] === "number") {
        if (Math.abs(json1[key] - json2[key]) > 0.0001) {
          diffs.push(key);
        }
      } else if (json1[key] !== json2[key]) {
        diffs.push(key);
      }
    } else if (typeof json2[key] === "object" && json2[key] !== null) {
      const nestedDiffs = getDifferentFields(json1[key], json2[key]);
      if (nestedDiffs.length > 0) {
        diffs.push(...nestedDiffs.map(d => `${key}.${d}`));
      }
    } else {
      diffs.push(key);
    }
  }

  for (const key of keys2) {
    if (!(key in json1)) {
      diffs.push(key);
    }
  }

  console.log("Differences found between json1 and json2:", diffs, "for json1:", JSON.stringify(json1), "json2:", JSON.stringify(json2));
  return diffs;
}

export const fetchServicesToDiff = () => {   
  return ["TKTAPIAccessor", "CUTSService", "cmmtsvc", "tssvcapi"];
}

export const fetchEnvironmentsToDiff = () => {   
  return ["DEV", "BETA", "UAT", "PROD"];
}

export const fetchHumioLink = (environment: string, diffId: string, serviceName: string) => {
  return "humio" + environment + diffId + serviceName;
}

export const fetchDiffData = (diffingId: string, pxnum: number, environment: string, service: string) => {
  const diff = DIFF_DATASET.diffs.find(
    (d) =>
      d.diffingId === diffingId &&
      d.pxnum === pxnum &&
      d.environment.toLowerCase() === environment.toLowerCase() &&
      d.service.toLowerCase() === service.toLowerCase()
  );
  return diff ? { sunJson: diff.sunJson, linuxJson: diff.linuxJson } : null;
};

export const fetchMigrationStats = (startDate?: string, endDate?: string) => {
  const services = fetchServicesToDiff();
  const stats: {
    service: string;
    environment: string;
    totalDiffs: number;
    differencesCount: number;
    status: string;
    apis: { api: string; diffingId: string; environment: string; differences: number; status: string }[];
  }[] = [];

  services.forEach((service) => {
    const serviceDiffs = DIFF_DATASET.diffs.filter((d) => d.service === service);
    const environments = [...new Set(serviceDiffs.map((d) => d.environment))];

    environments.forEach((environment) => {
      let diffs = serviceDiffs.filter((d) => d.environment === environment);

      // Apply time range filter if provided
      if (startDate && endDate) {
        const start = new Date(startDate);
        const end = new Date(endDate);
        diffs = diffs.filter((d) => {
          const diffDate = new Date(d.date);
          return diffDate >= start && diffDate <= end;
        });
      }

      const totalDiffs = diffs.length;
      let differencesCount = 0;

      diffs.forEach((diff) => {
        differencesCount += getDifferentFields(diff.sunJson, diff.linuxJson).length;
      });

      // Get APIs for this service and environment, filtered by date range if applicable
      const apis = (MOCK_API_DATA[service] || [])
        .filter((api) => api.environment === environment)
        .filter((api) => {
          if (!startDate || !endDate) return true;
          const diffDate = new Date(api.date || DIFF_DATASET.diffs.find(d => d.diffingId === api.diffingId)?.date || "");
          const start = new Date(startDate);
          const end = new Date(endDate);
          return diffDate >= start && diffDate <= end;
        })
        .map((api) => {
          const diff = DIFF_DATASET.diffs.find(d => d.diffingId === api.diffingId);
          const differences = api.differences || (diff ? getDifferentFields(diff.sunJson, diff.linuxJson).length : 0);
          return {
            ...api,
            api: api.apiName, // Use apiName as api for consistency
            status: differences === 0 ? "Completed" : differences < 3 ? "In Progress" : "Issues Detected",
          };
        });

      const status = differencesCount === 0 ? "Completed" : differencesCount < 5 ? "In Progress" : "Issues Detected";
      stats.push({ service, environment, totalDiffs, differencesCount, status, apis });
    });
  });

  const totalAPIs = stats.reduce((sum, s) => sum + s.apis.length, 0);
  const completedAPIs = stats.reduce((sum, s) => sum + s.apis.filter((a) => a.status === "Completed").length, 0);
  const percentageMigrated = totalAPIs > 0 ? (completedAPIs / totalAPIs) * 100 : 0;

  console.log("Migration Stats:", { stats, totalAPIs, completedAPIs, percentageMigrated });

  return { stats, percentageMigrated };
};