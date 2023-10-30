import { Helmet } from 'react-helmet-async';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { loginFetch } from '../../data/auth';
import { useNavigate } from 'react-router-dom';

interface IAdminLoginForm {
  username: string;
  password: string;
}

export const AdminLogin = () => {
  const { register, handleSubmit } = useForm<IAdminLoginForm>();
  const [error, setError] = useState(false);
  const navigate = useNavigate();

  const submitAction = handleSubmit(async (loginForm) => {
    loginFetch(loginForm)
      .then((result) => {
        if (result) {
          navigate('/admin');
        } else {
          setError(true);
        }
      })
      .catch(() => {
        setError(true);
      });
  });
  return (
    <>
      <Helmet>
        <title>just read comics | login</title>
      </Helmet>
      <div className="d-flex align-items-center py-4 bg-body-tertiary vh-100">
        <main className="form-signin w-100 m-auto" style={{ maxWidth: '330px' }}>
          <form onSubmit={submitAction}>
            <h1 className="h3 mb-3 fw-normal">Please sign in</h1>

            {error && <p className="text-danger">Sorry that login didn't work.</p>}
            <div className="form-floating">
              <input {...register('username')} type="email" className="form-control" id="username" placeholder="name@example.com" autoComplete="off" />
              <label htmlFor="username">Email address</label>
            </div>
            <div className="form-floating">
              <input {...register('password')} type="password" className="form-control" id="password" placeholder="Password" />
              <label htmlFor="password">Password</label>
            </div>

            <div className="form-check text-start my-3">
              <input className="form-check-input" type="checkbox" value="remember-me" id="flexCheckDefault" />
              <label className="form-check-label" htmlFor="flexCheckDefault">
                Remember me
              </label>
            </div>
            <button className="btn btn-primary w-100 py-2" type="submit">
              Sign in
            </button>
            <p className="mt-5 mb-3 text-body-secondary">&copy; justreadcomics.com {new Date().getFullYear()}</p>
          </form>
        </main>
      </div>
    </>
  );
};
