// @vitest-environment jsdom

import { screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { renderWithProviders } from "test-utils/render-with-providers";

const { useWidgetAPI } = vi.hoisted(() => ({ useWidgetAPI: vi.fn() }));
vi.mock("utils/proxy/use-widget-api", () => ({ default: useWidgetAPI }));

vi.mock("next/image", () => ({
  // eslint-disable-next-line @next/next/no-img-element
  default: (props) => <img alt={props.alt} src={props.src} />,
}));

import Component from "./component";

const album = {
  artist: "The Dictators",
  name: "Go Girl Crazy",
  releaseDate: "1975",
  globalReviewsUrl: "https://1001albumsgenerator.com/albums/39ZIit32CoCg83Hl0bJwgN/go-girl-crazy",
  images: [{ url: "https://example.com/cover.jpg", width: 300, height: 300 }],
  spotifyId: "39ZIit32CoCg83Hl0bJwgN",
  appleMusicId: "607581053",
  tidalId: 78539,
  youtubeMusicId: "OLAK5uy_mjGjpJTCPQAihuQNnbArQEpNi2Dk4G808",
  deezerId: "79379",
};

describe("widgets/1001albums/component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders loading state when no data", () => {
    useWidgetAPI.mockReturnValue({ data: undefined, error: undefined });

    renderWithProviders(<Component service={{ widget: { type: "1001albums", project: "test" } }} />, {
      settings: { hideErrors: false },
    });

    expect(screen.getByText("1001albums.loading")).toBeInTheDocument();
  });

  it("renders album info and default streaming links", () => {
    useWidgetAPI.mockReturnValue({ data: { currentAlbum: album }, error: undefined });

    renderWithProviders(<Component service={{ widget: { type: "1001albums", project: "test" } }} />, {
      settings: { hideErrors: false },
    });

    expect(screen.getByText("Go Girl Crazy")).toBeInTheDocument();
    expect(screen.getByText("The Dictators")).toBeInTheDocument();
    expect(screen.getByText("1975")).toBeInTheDocument();

    expect(screen.getByLabelText("Spotify")).toHaveAttribute(
      "href",
      `https://open.spotify.com/album/${album.spotifyId}`,
    );
    expect(screen.getByLabelText("Apple Music")).toHaveAttribute(
      "href",
      `https://music.apple.com/album/${album.appleMusicId}`,
    );
    expect(screen.getByLabelText("Tidal")).toHaveAttribute(
      "href",
      `https://tidal.com/browse/album/${album.tidalId}`,
    );
    expect(screen.getByLabelText("YouTube Music")).toHaveAttribute(
      "href",
      `https://music.youtube.com/playlist?list=${album.youtubeMusicId}`,
    );
    expect(screen.queryByLabelText("Deezer")).not.toBeInTheDocument();
  });

  it("respects configured links", () => {
    useWidgetAPI.mockReturnValue({ data: { currentAlbum: album }, error: undefined });

    renderWithProviders(
      <Component service={{ widget: { type: "1001albums", project: "test", links: ["spotify", "deezer"] } }} />,
      { settings: { hideErrors: false } },
    );

    expect(screen.getByLabelText("Spotify")).toBeInTheDocument();
    expect(screen.getByLabelText("Deezer")).toHaveAttribute("href", `https://www.deezer.com/album/${album.deezerId}`);
    expect(screen.queryByLabelText("Tidal")).not.toBeInTheDocument();
    expect(screen.queryByLabelText("Apple Music")).not.toBeInTheDocument();
  });

  it("omits services that have no id on the album", () => {
    useWidgetAPI.mockReturnValue({ data: { currentAlbum: { ...album, tidalId: undefined } }, error: undefined });

    renderWithProviders(<Component service={{ widget: { type: "1001albums", project: "test" } }} />, {
      settings: { hideErrors: false },
    });

    expect(screen.queryByLabelText("Tidal")).not.toBeInTheDocument();
    expect(screen.getByLabelText("Spotify")).toBeInTheDocument();
  });

  it("hides history by default", () => {
    useWidgetAPI.mockReturnValue({
      data: {
        currentAlbum: album,
        history: [
          {
            generatedAlbumId: "h1",
            album: { ...album, name: "Prev 1", globalReviewsUrl: "https://example.com/p1" },
          },
        ],
      },
      error: undefined,
    });

    renderWithProviders(<Component service={{ widget: { type: "1001albums", project: "test" } }} />, {
      settings: { hideErrors: false },
    });

    expect(screen.queryByTestId("1001albums-history")).not.toBeInTheDocument();
  });

  it("renders the configured number of previous albums, newest first", () => {
    const history = Array.from({ length: 4 }, (_, i) => ({
      generatedAlbumId: `h${i}`,
      album: {
        ...album,
        name: `Prev ${i}`,
        globalReviewsUrl: `https://example.com/p${i}`,
        images: [{ url: `https://example.com/p${i}.jpg`, width: 300, height: 300 }],
      },
    }));
    useWidgetAPI.mockReturnValue({ data: { currentAlbum: album, history }, error: undefined });

    renderWithProviders(
      <Component service={{ widget: { type: "1001albums", project: "test", history: 2 } }} />,
      { settings: { hideErrors: false } },
    );

    const container = screen.getByTestId("1001albums-history");
    const links = container.querySelectorAll("a");
    expect(links).toHaveLength(2);
    expect(links[0]).toHaveAttribute("href", "https://example.com/p3");
    expect(links[1]).toHaveAttribute("href", "https://example.com/p2");
  });
});
