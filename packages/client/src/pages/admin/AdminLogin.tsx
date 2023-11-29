import { Helmet } from 'react-helmet-async';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { loginFetch } from '../../data/auth';
import { useNavigate } from 'react-router-dom';
import { Button, FloatingLabel, Form, Stack } from 'react-bootstrap';

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
      <Stack className="align-items-center py-4 bg-body-tertiary vh-100">
        <main className="form-signin w-100 m-auto" style={{ maxWidth: '330px' }}>
          <Form onSubmit={submitAction}>
            <h1 className="h3 mb-3 fw-normal">Please sign in</h1>

            {error && <p className="text-danger">Sorry that login didn't work.</p>}
            <FloatingLabel controlId="username" label="Email address" className="mb-1">
              <Form.Control {...register('username')} type="email" id="username" placeholder="name@example.com" autoComplete="off" />
            </FloatingLabel>
            <FloatingLabel controlId="password" label="Password" className="mb-3">
              <Form.Control {...register('password')} type="password" id="password" placeholder="Password" />
            </FloatingLabel>
            <Button variant="primary" className="w-100 py-2" type="submit">
              Sign in
            </Button>
            <p className="mt-5 mb-3 text-body-secondary">&copy; justreadcomics.com {new Date().getFullYear()}</p>
          </Form>
        </main>
      </Stack>
    </>
  );
};
