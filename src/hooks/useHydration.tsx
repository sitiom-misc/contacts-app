import { useEffect, useState } from "react"
import useContactStore from "../store"

const useHydration = () => {
  const [hydrated, setHydrated] = useState(useContactStore.persist.hasHydrated)

  useEffect(() => {
    const unsubHydrate = useContactStore.persist.onHydrate(() => setHydrated(false))

    const unsubFinishHydration = useContactStore.persist.onFinishHydration(() => setHydrated(true))

    setHydrated(useContactStore.persist.hasHydrated())

    return () => {
      unsubHydrate()
      unsubFinishHydration()
    }
  }, [])

  return hydrated
}

export default useHydration
