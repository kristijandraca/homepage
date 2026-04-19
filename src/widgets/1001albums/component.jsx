import Container from "components/services/widget/container";
import Image from "next/image";
import { useTranslation } from "next-i18next";
import { MdLibraryMusic } from "react-icons/md";
import { SiApplemusic, SiSpotify, SiTidal, SiYoutubemusic } from "react-icons/si";

import useWidgetAPI from "utils/proxy/use-widget-api";

const STREAMING_SERVICES = {
  spotify: {
    idField: "spotifyId",
    url: (id) => `https://open.spotify.com/album/${id}`,
    Icon: SiSpotify,
    label: "Spotify",
  },
  appleMusic: {
    idField: "appleMusicId",
    url: (id) => `https://music.apple.com/album/${id}`,
    Icon: SiApplemusic,
    label: "Apple Music",
  },
  tidal: {
    idField: "tidalId",
    url: (id) => `https://tidal.com/browse/album/${id}`,
    Icon: SiTidal,
    label: "Tidal",
  },
  youtubeMusic: {
    idField: "youtubeMusicId",
    url: (id) => `https://music.youtube.com/playlist?list=${id}`,
    Icon: SiYoutubemusic,
    label: "YouTube Music",
  },
  amazonMusic: {
    idField: "amazonMusicId",
    url: (id) => `https://music.amazon.com/albums/${id}`,
    Icon: MdLibraryMusic,
    label: "Amazon Music",
  },
  deezer: {
    idField: "deezerId",
    url: (id) => `https://www.deezer.com/album/${id}`,
    Icon: MdLibraryMusic,
    label: "Deezer",
  },
  qobuz: {
    idField: "qobuzId",
    url: (id) => `https://open.qobuz.com/album/${id}`,
    Icon: MdLibraryMusic,
    label: "Qobuz",
  },
};

const DEFAULT_LINKS = ["spotify", "appleMusic", "tidal", "youtubeMusic"];

export default function Component({ service }) {
  const { t } = useTranslation();
  const { widget } = service;

  const { data, error } = useWidgetAPI(widget, "project");

  if (error) {
    return <Container service={service} error={error} />;
  }

  if (!data?.currentAlbum) {
    return (
      <Container service={service}>
        <div className="text-xs text-theme-700 dark:text-theme-200 m-1 p-1">{t("1001albums.loading")}</div>
      </Container>
    );
  }

  const album = data.currentAlbum;
  const cover = album.images?.find((img) => img.width <= 300) ?? album.images?.[0];
  const configured = Array.isArray(widget.links) && widget.links.length > 0 ? widget.links : DEFAULT_LINKS;
  const availableLinks = configured
    .map((name) => ({ name, service: STREAMING_SERVICES[name] }))
    .filter(({ service: s }) => s && album[s.idField])
    .map(({ name, service: s }) => ({ name, ...s, href: s.url(album[s.idField]) }));

  const historyCount = parseInt(widget.history, 10) || 0;
  const historyAlbums =
    historyCount > 0 && Array.isArray(data.history) ? data.history.slice(-historyCount).reverse() : [];

  return (
    <Container service={service}>
      <div className="flex flex-col w-full m-1">
        <div className="flex flex-row w-full items-center bg-theme-200/50 dark:bg-theme-900/20 rounded-md p-2 min-h-[68px]">
          {cover?.url && (
            <a
              href={album.globalReviewsUrl}
              target="_blank"
              rel="noreferrer"
              className="shrink-0 w-[56px] h-[56px] relative rounded-sm overflow-hidden"
            >
              <Image
                src={cover.url}
                alt={`${album.artist} - ${album.name}`}
                width={56}
                height={56}
                className="object-cover"
              />
            </a>
          )}
          <div className="flex flex-col flex-1 ml-2 min-w-0 text-xs">
            <a
              href={album.globalReviewsUrl}
              target="_blank"
              rel="noreferrer"
              className="font-bold truncate hover:underline"
              title={album.name}
            >
              {album.name}
            </a>
            <span className="font-thin truncate" title={album.artist}>
              {album.artist}
            </span>
            {album.releaseDate && <span className="font-thin opacity-60">{album.releaseDate}</span>}
            {availableLinks.length > 0 && (
              <div className="flex flex-row flex-wrap gap-2 mt-1">
                {availableLinks.map(({ name, href, Icon, label }) => (
                  <a
                    key={name}
                    href={href}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={label}
                    title={label}
                    className="opacity-75 hover:opacity-100"
                  >
                    <Icon className="w-4 h-4" />
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>
        {historyAlbums.length > 0 && (
          <div className="flex flex-row flex-wrap gap-1 mt-1" data-testid="1001albums-history">
            {historyAlbums.map((entry) => {
              const prev = entry.album;
              const prevCover = prev?.images?.find((img) => img.width <= 300) ?? prev?.images?.[0];
              if (!prev || !prevCover?.url) return null;
              return (
                <a
                  key={entry.generatedAlbumId}
                  href={prev.globalReviewsUrl}
                  target="_blank"
                  rel="noreferrer"
                  title={`${prev.artist} - ${prev.name}`}
                  className="shrink-0 w-[40px] h-[40px] relative rounded-sm overflow-hidden opacity-75 hover:opacity-100"
                >
                  <Image
                    src={prevCover.url}
                    alt={`${prev.artist} - ${prev.name}`}
                    width={40}
                    height={40}
                    className="object-cover"
                  />
                </a>
              );
            })}
          </div>
        )}
      </div>
    </Container>
  );
}
