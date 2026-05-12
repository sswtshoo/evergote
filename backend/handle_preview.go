package main

import (
	"net/http"
	"strings"
	"time"

	"golang.org/x/net/html"
)

type LinkPreview struct {
	Title       string `json:"title"`
	Image       string `json:"image"`
	Description string `json:"description"`
	URL         string `json:"url"`
}

func (cfg *apiConfig) handlePreview(w http.ResponseWriter, req *http.Request) {
	url := req.URL.Query().Get("url")
	if url == "" {
		respondWithError(w, http.StatusBadRequest, "url param is required", nil)
		return
	}

	if !strings.HasPrefix(url, "http://") && !strings.HasPrefix(url, "https://") {
		url = "https://" + url
	}
	client := &http.Client{Timeout: 5 * time.Second}
	res, err := client.Get(url)
	if err != nil {
		respondWithError(w, http.StatusInternalServerError, "failed to fetch url", err)
		return
	}
	defer res.Body.Close()
	doc, err := html.Parse(res.Body)
	if err != nil {
		respondWithError(w, http.StatusInternalServerError, "failed to parse html", err)
		return
	}
	preview := extractPreview(doc, url)
	respondWithJson(w, http.StatusOK, preview)
}

func extractPreview(node *html.Node, pageUrl string) LinkPreview {
	preview := LinkPreview{URL: pageUrl}
	// base, _ := url.Parse(pageUrl)

	var walk func(*html.Node)
	walk = func(n *html.Node) {
		if n.Type == html.ElementNode {
			switch n.Data {
			case "title":
				if preview.Title == "" && n.FirstChild != nil {
					preview.Title = n.FirstChild.Data
				}
			case "meta":
				attrs := attrMap(n)
				switch {
				case attrs["property"] == "og:title" && preview.Title == "":
					preview.Title = attrs["content"]
				case attrs["property"] == "og:description" && preview.Description == "":
					preview.Description = attrs["content"]
				case attrs["name"] == "description" && preview.Description == "":
					preview.Description = attrs["content"]
				case attrs["property"] == "og:image" && preview.Image == "":
					preview.Image = attrs["content"]

				}
			}
		}
		for c := n.FirstChild; c != nil; c = c.NextSibling {
			walk(c)
		}
	}
	walk(node)
	return preview
}

func attrMap(n *html.Node) map[string]string {
	m := make(map[string]string)
	for _, a := range n.Attr {
		m[a.Key] = a.Val
	}
	return m
}
