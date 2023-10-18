import uniqid from 'uniqid';
import { Creator } from '../../../types/series';
import { ChangeEvent } from 'react';

export const EditCreator = ({
  credit,
  removeCredit,
  updateCredits
}: {
  credit: Creator;
  updateCredits: (c: Creator) => void;
  removeCredit: (order: number) => void;
}) => {
  const uniqueId = uniqid();

  const updateCreatorName = (e: ChangeEvent<HTMLInputElement>) => {
    const newCredit = credit;
    newCredit.name = e.target.value;
    updateCredits(newCredit);
  };

  const updateCreatorRole = (e: ChangeEvent<HTMLInputElement>) => {
    const newCredit = credit;
    newCredit.role = e.target.value;
    updateCredits(newCredit);
  };

  return (
    <div className="row g-2 align-items-center" key={uniqueId}>
      <div className="col-md form-floating mb-3">
        <input
          type="text"
          className="form-control"
          id={`creatorName-${uniqueId}`}
          defaultValue={credit.name}
          placeholder="Si Spurrier"
          onBlur={updateCreatorName}
        />
        <label htmlFor={`creatorName-${uniqueId}`}>Creator Name</label>
      </div>
      <div className="col-md form-floating mb-3">
        <input type="text" className="form-control" id={`creatorRole-${uniqueId}`} defaultValue={credit.role} placeholder="Writer" onBlur={updateCreatorRole} />
        <label htmlFor={`creatorRole-${uniqueId}`}>Role</label>
      </div>
      <div className="col-1">
        <button type="button" className={'btn btn-danger'} onClick={() => removeCredit(credit.order)}>
          X
        </button>
      </div>
    </div>
  );
};
