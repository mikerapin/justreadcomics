import classNames from 'classnames';
import { Button, ButtonGroup, Stack } from 'react-bootstrap';

export const Pagination = ({
  hasNext,
  hasPrev,
  nextAction,
  prevAction
}: {
  hasNext?: boolean;
  hasPrev?: boolean;
  nextAction: () => void;
  prevAction: () => void;
}) => {
  if (!hasNext && !hasPrev) {
    return <></>;
  }
  return (
    <Stack direction="horizontal" className="justify-content-center">
      <ButtonGroup className="mt-5" role="group">
        <Button variant="primary" className={classNames({ invisible: !hasPrev })} onClick={prevAction}>
          <i className="bi bi-arrow-left-square-fill"></i>&nbsp;Prev
        </Button>
        <Button variant="primary" className={classNames({ invisible: !hasNext })} type="button" onClick={nextAction}>
          Next&nbsp;
          <i className="bi bi-arrow-right-square-fill"></i>
        </Button>
      </ButtonGroup>
    </Stack>
  );
};
