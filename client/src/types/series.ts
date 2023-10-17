export interface Creator {
  name: string;
  role: string;
}

export interface ISeries {
  seriesName: string;
  description?: string;
  image?: string;
  credits?: Creator[];
  services?: string[];
  meta: {
    searches: number;
    clickOuts: number;
  };
  lastScan?: string;
}
