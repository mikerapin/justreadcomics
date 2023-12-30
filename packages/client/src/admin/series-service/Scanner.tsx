import { seriesScanners } from '../../static/const';
import { useState } from 'react';
import { IScannerResult, triggerScanner } from '../../data/scanner';
import { Dropdown, DropdownButton } from 'react-bootstrap';
import { ISeriesService } from '@justreadcomics/common/dist/types/series';

interface ScannerProps {
  seriesService?: ISeriesService;
  seriesId?: string;
  scanWithExtras?: boolean;
  scannerResultCallback: (result: IScannerResult) => void;
  showErrorToastCall: (message: string) => void;
}

export const Scanner = ({
  seriesService,
  seriesId,
  scannerResultCallback,
  showErrorToastCall
}: ScannerProps) => {
  const [inProgress, setInProgress] = useState(false);
  if (!seriesService || !seriesId) {
    return <></>;
  }
  const service = seriesScanners.find((s) => s.seriesServiceId === seriesService._id);

  if (service) {
    const lastScan = seriesService.lastScan;
    const yesterday = new Date(new Date().getTime() - 24 * 60 * 60 * 1000).getTime();
    const disableButton = lastScan ? new Date(lastScan).getTime() - yesterday > 0 : false;
    const handleClick = (cleanedTitle: boolean) => {
      setInProgress(true);
      triggerScanner(service.seriesServiceId, seriesId, cleanedTitle)
        .then((res) => {
          if (res) {
            scannerResultCallback(res);
          }
        })
        .catch((e: any) => {
          showErrorToastCall(e);
        })
        .finally(() => {
          setInProgress(false);
        });
    };

    const title = inProgress ? (
      <div className="spinner-border spinner-border-sm" role="status">
        <span className="visually-hidden">Loading...</span>
      </div>
    ) : (
      <span>Scan</span>
    );
    return (
      <DropdownButton id="dropdown-basic-button" title={title} disabled={inProgress || disableButton}>
        <Dropdown.Item onClick={() => handleClick(false)}>Scan Full Title</Dropdown.Item>
        <Dropdown.Item onClick={() => handleClick(true)}>Scan Cleaned Title</Dropdown.Item>
      </DropdownButton>
    );
  }
  return <></>;
};
