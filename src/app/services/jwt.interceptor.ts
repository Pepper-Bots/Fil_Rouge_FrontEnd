import { HttpInterceptorFn } from '@angular/common/http';

export const jwtInterceptor: HttpInterceptorFn = (req, next) => {

  const jwt = localStorage.getItem('jwt');

  if (jwt) {

    // clone = requeteAvecJwt
    const requeteAvecJwt = req.clone({
      setHeaders: {Authorization: "Bearer" + jwt} //Autre écriture : TODO -> `Bearer ${jwt}`
    })

    return next(requeteAvecJwt);

  }

  return next(req);
};
