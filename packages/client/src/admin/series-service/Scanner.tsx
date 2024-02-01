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

export const Scanner = ({ seriesService, seriesId, scannerResultCallback, showErrorToastCall }: ScannerProps) => {
  const [inProgress, setInProgress] = useState(false);
  if (!seriesService || !seriesId) {
    return <></>;
  }
  const seriesServiceScanner = seriesScanners.find((s) => s.seriesServiceId === seriesService._id);

  if (!seriesServiceScanner) {
    return <></>;
  }

  const lastScan = seriesService.lastScan;
  const yesterday = new Date(new Date().getTime() - 24 * 60 * 60 * 1000).getTime();
  const disableButton = lastScan ? new Date(lastScan).getTime() - yesterday > 0 : false;
  const handleClick = (cleanedTitle: boolean, fetchMetaData: boolean) => {
    setInProgress(true);
    triggerScanner(seriesServiceScanner.seriesServiceId, seriesId, cleanedTitle, fetchMetaData)
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
  const refreshClick = () => {
    setInProgress(true);
    triggerScanner(seriesServiceScanner.seriesServiceId, seriesId, false, false, true)
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
  console.log(seriesServiceScanner);
  return (
    <DropdownButton id="dropdown-basic-button" title={title} disabled={inProgress || disableButton}>
      {seriesServiceScanner.availability && (
        <>
          <Dropdown.Item onClick={() => handleClick(false, false)}>Full Title & Availability</Dropdown.Item>
          <Dropdown.Item onClick={() => handleClick(true, false)}>Cleaned Title & Availability</Dropdown.Item>
        </>
      )}
      {seriesServiceScanner.availability && seriesServiceScanner.metadata && <Dropdown.Divider />}
      {seriesServiceScanner.metadata && (
        <>
          <Dropdown.Item onClick={() => handleClick(false, true)}>Full Title & Fetch Metadata</Dropdown.Item>
          <Dropdown.Item onClick={() => handleClick(true, true)}>Cleaned Title & Fetch Metadata</Dropdown.Item>
        </>
      )}
      {seriesServiceScanner.refresh && seriesService.seriesServiceUrl && (
        <Dropdown.Item onClick={() => refreshClick()}>Refresh Metadata</Dropdown.Item>
      )}
    </DropdownButton>
  );
};
