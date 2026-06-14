package com.vishwakarma.backend.security.filter;

import jakarta.servlet.*;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletRequestWrapper;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.*;
import java.util.regex.Pattern;

@Component
@Order(3)
public class InputSanitizationFilter implements Filter {

    private static final Pattern SCRIPT_PATTERN = Pattern.compile("<script[^>]*>.*?</script>", Pattern.CASE_INSENSITIVE | Pattern.DOTALL);
    private static final Pattern EVENT_PATTERN = Pattern.compile("\\s(on\\w+)\\s*=", Pattern.CASE_INSENSITIVE);
    private static final Pattern JS_PATTERN = Pattern.compile("javascript\\s*:", Pattern.CASE_INSENSITIVE);

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
            throws IOException, ServletException {

        if (request instanceof HttpServletRequest httpRequest) {
            chain.doFilter(new SanitizedRequest(httpRequest), response);
        } else {
            chain.doFilter(request, response);
        }
    }

    private static String sanitize(String value) {
        if (value == null) return null;
        String s = SCRIPT_PATTERN.matcher(value).replaceAll("");
        s = EVENT_PATTERN.matcher(s).replaceAll(" disabled-$1=");
        s = JS_PATTERN.matcher(s).replaceAll("blocked:");
        return s;
    }

    static class SanitizedRequest extends HttpServletRequestWrapper {

        private final Map<String, String[]> sanitizedParams;

        SanitizedRequest(HttpServletRequest request) {
            super(request);
            Map<String, String[]> original = request.getParameterMap();
            Map<String, String[]> sanitized = new LinkedHashMap<>();
            for (Map.Entry<String, String[]> entry : original.entrySet()) {
                String[] values = entry.getValue();
                String[] sanitizedValues = new String[values.length];
                for (int i = 0; i < values.length; i++) {
                    sanitizedValues[i] = sanitize(values[i]);
                }
                sanitized.put(sanitize(entry.getKey()), sanitizedValues);
            }
            this.sanitizedParams = Collections.unmodifiableMap(sanitized);
        }

        @Override
        public String getParameter(String name) {
            String[] values = sanitizedParams.get(name);
            return values != null && values.length > 0 ? values[0] : null;
        }

        @Override
        public Map<String, String[]> getParameterMap() {
            return sanitizedParams;
        }

        @Override
        public Enumeration<String> getParameterNames() {
            return Collections.enumeration(sanitizedParams.keySet());
        }

        @Override
        public String[] getParameterValues(String name) {
            return sanitizedParams.get(name);
        }
    }
}
