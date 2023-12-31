import { CORPO_SERVICE_ID } from '@justreadcomics/common/dist/const';
import { ISeries, ISeriesServiceType } from '@justreadcomics/common/dist/types/series';

/**
 * Run multiple promises in sequence and return the results as array.
 * Similar to Promise.all(), but instead of running in parallel
 * it runs in sequence.
 *
 * source: https://medium.com/@dragossebestin/functional-way-of-executing-an-array-of-promises-sequentially-1916fe3b31b2
 */
export async function promiseAllSequence<ElementType, PromisedReturnType>(
  items: ElementType[],
  functor: (item: ElementType) => Promise<PromisedReturnType>
): Promise<PromisedReturnType[]> {
  return items.reduce(
    (promiseChain, item) =>
      promiseChain.then((resultsSoFar) => functor(item).then((currentResult) => [...resultsSoFar, currentResult])),
    Promise.resolve<PromisedReturnType[]>([])
  );
}

export const insertOrUpdateSeriesService = (series: ISeries, serviceID: string, seriesPageUrl: string) => {
  const corpoResults = {
    _id: serviceID,
    seriesServiceUrl: seriesPageUrl,
    lastScan: new Date().toJSON()
  };

  if (series.services) {
    const corpoService = series.services.id(serviceID);

    if (corpoService) {
      corpoService.seriesServiceUrl = corpoResults.seriesServiceUrl;
      corpoService.lastScan = corpoResults.lastScan;
    } else {
      series.services.push(corpoResults);
    }
  } else {
    series.services = [corpoResults] as ISeriesServiceType;
  }
};
