package com.vishwakarma.backend.security;

import com.auth0.jwk.Jwk;
import com.auth0.jwk.JwkProvider;
import com.auth0.jwk.UrlJwkProvider;
import com.auth0.jwt.JWT;
import com.auth0.jwt.algorithms.Algorithm;
import com.auth0.jwt.interfaces.DecodedJWT;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.net.URL;
import java.security.interfaces.RSAPublicKey;
import java.util.List;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class ClerkJwtAuthFilter extends OncePerRequestFilter {

    private final String clerkIssuer;
    private final JwkProvider jwkProvider;

    private final ConcurrentHashMap<String, DecodedJWT> cache = new ConcurrentHashMap<>();

    public ClerkJwtAuthFilter(@Value("${clerk.jwt.issuer}") String clerkIssuer) throws Exception {
        this.clerkIssuer = clerkIssuer;
        String jwksUrl = clerkIssuer + "/.well-known/jwks.json";
        this.jwkProvider = new UrlJwkProvider(new URL(jwksUrl));
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {
        String authHeader = request.getHeader("Authorization");

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        String token = authHeader.substring(7);

        try {
            DecodedJWT jwt = JWT.decode(token);

            String kid = jwt.getKeyId();
            Jwk jwk = jwkProvider.get(kid);
            RSAPublicKey publicKey = (RSAPublicKey) jwk.getPublicKey();

            Algorithm algorithm = Algorithm.RSA256(publicKey, null);
            algorithm.verify(jwt);

            if (!jwt.getIssuer().equals(clerkIssuer)) {
                filterChain.doFilter(request, response);
                return;
            }

            String subject = jwt.getSubject();
            String email = jwt.getClaim("email").asString();
            String firstName = jwt.getClaim("firstName").asString();
            String lastName = jwt.getClaim("lastName").asString();
            String role = jwt.getClaim("role").asString();

            if (role == null) role = "MEMBER";

            List<SimpleGrantedAuthority> authorities = List.of(
                    new SimpleGrantedAuthority("ROLE_" + role)
            );

            ClerkUserDetails principal = new ClerkUserDetails(subject, email, firstName, lastName, role);
            UsernamePasswordAuthenticationToken authentication =
                    new UsernamePasswordAuthenticationToken(principal, token, authorities);

            SecurityContextHolder.getContext().setAuthentication(authentication);

        } catch (Exception e) {
            SecurityContextHolder.clearContext();
        }

        filterChain.doFilter(request, response);
    }
}
