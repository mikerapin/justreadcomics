// this is hardcoded and not good, but... here we are
import { seriesScanners } from '../../../static/const';
import { useState } from 'react';
import classNames from 'classnames';
import { triggerScanner } from '../../../data/scanner';
import { ISeriesServices } from '../../../types/series';

export const Scanner = ({ seriesService, seriesId }: { seriesService?: ISeriesServices; seriesId?: string }) => {
  const [inProgress, setInProgress] = useState(false);
  if (!seriesService || !seriesId) {
    return <></>;
  }
  const service = seriesScanners.find((s) => s.seriesServiceId === seriesService.id);

  if (service) {
    const lastScan = seriesService.lastScan;
    const yesterday = new Date(new Date().getTime() - 24 * 60 * 60 * 1000).getTime();
    const disableButton = lastScan ? new Date(lastScan).getTime() - yesterday > 0 : false;
    const handleClick = () => {
      setInProgress(true);
      triggerScanner(service.seriesServiceId, seriesId).then(() => {
        setInProgress(false);
        // refresh the service in the parent somehow
      });
    };
    return (
      <button type="button" className={classNames('btn btn-secondary', { loading: inProgress })} onClick={handleClick} disabled={disableButton}>
        Scan Now
      </button>
    );
  }
  return <></>;
};
