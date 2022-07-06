import (
  "k8s.io/api/core/v1"
)

pod: v1.#Pod & {
  name: "pod"
}