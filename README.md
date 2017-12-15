# Game Industry Career Visualizations

This repository contains the python scripts we used to access the MobyGames API and the visualizations that we built to explore the data.

`/python` contains the data manipulation scripts.
`/visualizer` contains the web-based visualizations.
Due to our licensing agreement with MobyGames, the data itself is stored separately, and is available by request.

## About the Project

There has been a great deal of concern in recent years about
burnout in the game development industry, and we’re starting to
see more research into the game development community in
general. The contribution of this paper is to present
visualizations of changes in the game development community.
We approach this by using a modified Sankey diagram to
visualize changes in community structure, and multi-line graphs
to visualize the career span of both a random sampling of
developers.

We will be taking two primary approaches to analysis:
community trends and employment trends. The community trends
visualizations explores changes in collaboration structures over
time, as well as influence of individual developers. The
employment trends explores the overall time developers are
staying in industry.

In the community structure visualization we will be looking at
changes in collaboration over time and influence of individual
developers on sub-communities. This visualization depicts the
movement of individual developers from game project to game
project over time, illustrating trends in the persistence of groups
of collaborating developers. Do developers frequently work with
other developers with whom they previously worked, as might be
expected in the case of (for instance) subsequent releases from the
same game development studio? How long, on average, does any
given developer remain a member of a single community within
the larger graph? Do community structures within the graph ever
split into smaller communities and later rejoin into larger ones
again? This visualization aims to answer questions of this nature.
We use two visualizations to examine employment trends. The
first demonstrates how long developers are staying in industry
based on starting years. The second shows how long developers in
different roles are staying in industry over time.

Our data was collected from the Mobygames database, which
contains data entries on games, which include descriptors, such as
release date, general descriptions, reviews, images, contributing
studios, and a list of credits. Any information pertaining to
individual game developers referenced or used in this paper was
pulled from that developer’s appearance in games credits.

## To Run

1. Put the datafiles in the `/visualizer/data` directory.
2. Start a webserver in the `/visualizer` directory and access one of the html pages.
