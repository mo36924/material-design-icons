FROM debian:10.10
RUN apt update;
RUN apt-get install -y --no-install-recommends ca-certificates git sfnt2woff-zopfli woff2;
RUN git clone --depth 1 https://github.com/google/material-design-icons.git; \
    /bin/bash -c 'for i in /material-design-icons/font/*.{ttf,otf}; do sfnt2woff-zopfli -n 100 $i; woff2_compress $i; done;'; \
    mkdir -p /_material-design-icons/font; \
    cp /material-design-icons/LICENSE /_material-design-icons/LICENSE; \
    cp /material-design-icons/font/* /_material-design-icons/font/; \
    rm -rf /material-design-icons;

ENTRYPOINT ["/bin/bash", "-c", "cp -r /_material-design-icons/* /material-design-icons"]
