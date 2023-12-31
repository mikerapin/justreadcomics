import { seriesScanners } from '../../../static/const';
import { useState } from 'react';
import { triggerScanner } from '../../../data/scanner';
import { ISeries, ISeriesService } from '../../../types/series';

interface ScannerProps {
  seriesService?: ISeriesService;
  seriesId?: string;
  scannerResultCallback: (series: ISeries) => void;
}

export const Scanner = ({ seriesService, seriesId, scannerResultCallback }: ScannerProps) => {
  const [inProgress, setInProgress] = useState(false);
  if (!seriesService || !seriesId) {
    return <></>;
  }
  const service = seriesScanners.find((s) => s.seriesServiceId === seriesService._id);

  if (service) {
    const lastScan = seriesService.lastScan;
    const yesterday = new Date(new Date().getTime() - 24 * 60 * 60 * 1000).getTime();
    const disableButton = lastScan ? new Date(lastScan).getTime() - yesterday > 0 : false;
    const handleClick = () => {
      setInProgress(true);
      triggerScanner(service.seriesServiceId, seriesId).then((res) => {
        setInProgress(false);
        // refresh the service in the parent somehow
        scannerResultCallback(res.series);
      });
    };
    return (
      <button type="button" className="btn btn-secondary" onClick={handleClick} disabled={disableButton || inProgress}>
        {inProgress ? (
          <div className="spinner-border spinner-border-sm" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        ) : (
          'Scan Now'
        )}
      </button>
    );
  }
  return <></>;
};
