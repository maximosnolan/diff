// src/services/dataService.ts

// Hard-coded dataset of mock diff data with added serviceName and date fields, updated DIFF-1 for address.city difference
const DIFF_DATASET = {
  diffs: [
    {
      diffingId: "DIFF-1-TKTAPIAccessor-DEV-2023-01-01",
      pxnum: 999,
      environment: "DEV",
      service: "TKTAPIAccessor",
      serviceName: "TKTAPIAccessor",
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
        price: 100.50,
        location: "New York",
        counterpartyName: "ABC Corp",
        commission: 4.5,
        address: { city: "San Francisco", zip: "10001" }, // Changed address.city to differ
      },
    },
    {
      diffingId: "DIFF-2-CUTSService-BETA-2023-02-01",
      pxnum: 102,
      environment: "BETA",
      service: "CUTSService",
      serviceName: "CUTSService",
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
      date: "2023-03-01",
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
      serviceName: "tssvcapi",
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
      serviceName: "TKTAPIAccessor",
      date: "2023-05-01",
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
      serviceName: "CUTSService",
      date: "2023-06-01",
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
    {
      diffingId: "DIFF-7-TKTAPIAccessor-DEV-2023-07-01",
      pxnum: 999,
      environment: "DEV",
      service: "TKTAPIAccessor",
      serviceName: "TKTAPIAccessor",
      date: "2023-07-01",
      sunJson: {
        id: 1,
        traderName: "Eve Wilson",
        price: 110.00,
        location: "Seattle",
        counterpartyName: "MNO Corp",
        commission: 3.0,
        address: { city: "Seattle", zip: "98101" },
      },
      linuxJson: {
        id: 1,
        traderName: "Eve Wilson",
        price: 111.00,
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
        serviceName: "TKTAPIAccessor",
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
      {
        diffId: "DIFF-7-TKTAPIAccessor-DEV-2023-07-01",
        date: "2023-07-01",
        pxnum: 999,
        env: "DEV",
        serviceName: "TKTAPIAccessor",
        json1: {
          id: 1,
          traderName: "Eve Wilson",
          price: 110.00,
          location: "Seattle",
          counterpartyName: "MNO Corp",
          commission: 3.0,
          address: { city: "Seattle", zip: "98101" },
        },
        json2: {
          id: 1,
          traderName: "Eve Wilson",
          price: 111.00,
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
        serviceName: "cmmtsvc",
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
      d.environment.toLowerCase() === environment.toLowerCase() && // Case-insensitive
      d.service.toLowerCase() === service.toLowerCase() // Case-insensitive
  );

  console.log("Fetching diff data for:", { diffingId, pxnum, environment, service }, "Found diff:", diff);

  if (diff) {
    return {
      sunJson: diff.sunJson,
      linuxJson: diff.linuxJson,
    };
  }

  return null;
};

/*
  
ACCESSOR FOR DATA. HERE IS WHERE WE WILL MAKE CALLS TO UNDERLYING BAS SERVICE; FOR NOW, THIS RETURNS MOCK DATA
  
*/

export async function fetchDiffGroups(
  service: string,
  environment: string,
  startDate: string,
  endDate: string
): Promise<Record<string, { diffId: string; json1: any; json2: any }[]>> {
  // Assuming DIFF_DATASET is available or fetched from a data source
  const diffs = DIFF_DATASET.diffs.filter((diff) => {
    const diffDate = new Date(diff.date); // Use the explicit date field in "YYYY-MM-DD" format
    const start = new Date(startDate);
    const end = new Date(endDate);
    console.log("Filtering diff:", diff, "with service:", service, "environment:", environment, "dates:", { diffDate, start, end });
    return (
      diff.service.toLowerCase() === service.toLowerCase() && // Case-insensitive comparison
      diff.environment.toLowerCase() === environment.toLowerCase() && // Case-insensitive comparison
      !isNaN(diffDate.getTime()) && // Ensure diffDate is valid
      !isNaN(start.getTime()) && // Ensure start date is valid
      !isNaN(end.getTime()) && // Ensure end date is valid
      diffDate >= start &&
      diffDate <= end
    );
  });

  console.log("Filtered diffs for grouping:", diffs);

  if (diffs.length === 0) {
    console.warn("No diffs found for the given criteria");
    return {};
  }

  const groups: Record<string, { diffId: string; json1: any; json2: any }[]> = {};

  diffs.forEach((diff) => {
    // Use getDifferentFields to determine the differences
    const differences = getDifferentFields(diff.sunJson, diff.linuxJson)
      .sort() // Sort differences for consistent group keys
      .join(",");

    // Ensure the group key is not empty or undefined
    if (differences) {
      if (!groups[differences]) {
        groups[differences] = [];
      }
      groups[differences].push({
        diffId: diff.diffingId,
        json1: diff.sunJson,
        json2: diff.linuxJson,
      });
    } else {
      console.warn(`No differences found for diffId: ${diff.diffId}, skipping grouping`);
    }
  });

  console.log("Grouped diffs:", groups);
  return groups;
}

// Helper function to match DiffSelectionPage's getDifferentFields (copied here for consistency)
function getDifferentFields(json1: any, json2: any): string[] {
  const diffs = [];
  const keys1 = Object.keys(json1);
  const keys2 = Object.keys(json2);

  // Check all keys in json1
  for (const key of keys1) {
    if (!(key in json2)) {
      diffs.push(key); // Key exists in json1 but not in json2
    } else if (typeof json1[key] !== "object" || json1[key] === null) {
      // Handle scalar values (including numbers with small tolerance for floating-point precision)
      if (typeof json1[key] === "number" && typeof json2[key] === "number") {
        if (Math.abs(json1[key] - json2[key]) > 0.0001) { // Tolerance for floating-point comparison
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
      // If json1[key] is an object but json2[key] isn't, or vice versa, treat it as a difference
      diffs.push(key);
    }
  }

  // Check for keys in json2 that aren't in json1
  for (const key of keys2) {
    if (!(key in json1)) {
      diffs.push(key); // Key exists in json2 but not in json1
    }
  }

  console.log("Differences found between json1 and json2:", diffs, "for json1:", JSON.stringify(json1), "json2:", JSON.stringify(json2));
  return diffs;
}

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