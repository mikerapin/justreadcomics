import { getCoverImage } from '../util/image';

export const LoadingSeries = () => {
  return (
    <div className="container">
      <div className="row">
        <div className="col-4">
          <img className="img-fluid" src={getCoverImage(undefined)} alt="Loading" />
        </div>
        <div className="col-8">
          <div className="text-content">
            <h1 className="title">
              <div className="spinner-grow" style={{ width: '3rem', height: '3rem' }} role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </h1>
            <div className="text-center">
              <div className="spinner-border" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
