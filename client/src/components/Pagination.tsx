import classNames from 'classnames';

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
    <div className="d-flex justify-content-center">
      <div className="btn-group mt-5" role="group">
        <button className={classNames('btn btn-primary', { invisible: !hasPrev })} onClick={prevAction}>
          <i className="bi bi-arrow-left-square-fill"></i>Prev
        </button>
        <button className={classNames('btn btn-primary', { invisible: !hasNext })} type="button" onClick={nextAction}>
          Next&nbsp;
          <i className="bi bi-arrow-right-square-fill"></i>
        </button>
      </div>
    </div>
  );
};
