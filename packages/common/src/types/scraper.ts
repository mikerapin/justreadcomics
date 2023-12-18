export interface IMassDcImport {
  seriesName: string;
  seriesLink: string;
  ongoing?: boolean;
  seriesImage: string;
}
export interface IMassImageImport {
  seriesName: string;
  seriesLink: string;
}

export interface IdwApiProduct {
  title: string;
  handle: string;
  description: string;
  featured_image: string;
  type: "Book" | "Single Issue";
}

export interface IdwApiResponse {
  pagination_limit: number;
  products: IdwApiProduct[];
  products_count: number;
}

export interface ReturnMassProducts {
  seriesName: string;
  description: string;
  seriesImage: string;
  seriesLink: string;
}

export interface IShonenJumpSeries {
  seriesName: string;
  imageUrl: string;
  seriesLink: string;
}
