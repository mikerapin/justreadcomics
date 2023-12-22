import { seriesScanners } from '../../../static/const';
import { useState } from 'react';
import { triggerScanner } from '../../../data/scanner';
import { Button } from 'react-bootstrap';
import { IClientSeries } from '../../../types/series';
import { ISeriesService } from '@justreadcomics/common/dist/types/series';

interface ScannerProps {
  seriesService?: ISeriesService;
  seriesId?: string;
  scannerResultCallback: (series: IClientSeries) => void;
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
      <Button variant="secondary" type="button" onClick={handleClick} disabled={disableButton || inProgress}>
        {inProgress ? (
          <div className="spinner-border spinner-border-sm" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        ) : (
          'Scan Now'
        )}
      </Button>
    );
  }
  return <></>;
};
