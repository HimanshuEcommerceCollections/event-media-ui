"use client";

// /vendor — what is waiting on the vendor, what they have booked, and the
// offers they have not answered.
//
// The layout guard has already fetched GET /vendors/me, so the cards come
// from context rather than a second request. The open offers below them are
// the one extra call this page makes.

import { useEffect, useState } from "react";
import Link from "next/link";
import { getMyVendorAssignments } from "../../lib/api";
import { handleVendorAuthError, useVendorToken } from "./_lib/useVendorSession";
import { useVendor } from "./layout";

const dateOf = (value) => value || "Date to confirm";

export default function VendorOverviewView() {
  const token = useVendorToken();
  const { vendor, work } = useVendor();
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (token === undefined || token === null) return undefined;
    let live = true;
    setLoading(true);
    getMyVendorAssignments({ status: "offered", pageSize: 5 }, token)
      .then((data) => {
        if (live) setOffers(data?.items ?? []);
      })
      .catch((err) => {
        if (!live || handleVendorAuthError(err)) return;
        setError(err.message || "Could not load your offers.");
      })
      .finally(() => {
        if (live) setLoading(false);
      });
    return () => {
      live = false;
    };
  }, [token]);

  return (
    <>
      <div className="vd-head">
        <div>
          <h1>Overview</h1>
          <p>{vendor?.businessName ? `Signed in as ${vendor.businessName}.` : "Your vendor account."}</p>
        </div>
      </div>

      <div className="vd-cards">
        <div className="vd-card">
          <h3>Waiting on you</h3>
          <div className="n">{work?.openOffers ?? 0}</div>
          <div className="sub">Offers you have not answered</div>
        </div>
        <div className="vd-card">
          <h3>Accepted</h3>
          <div className="n">{work?.byStatus?.accepted ?? 0}</div>
          <div className="sub">Jobs on your books</div>
        </div>
        <div className="vd-card">
          <h3>Completed</h3>
          <div className="n">{work?.byStatus?.completed ?? 0}</div>
          <div className="sub">Finished and signed off</div>
        </div>
        <div className="vd-card">
          <h3>Booked earnings</h3>
          <div className="n">{work?.earningsLabel ?? "$0"}</div>
          {/* Deliberately not "paid": these are the payouts on work accepted
              or completed, which is not the same as money that has landed. */}
          <div className="sub">Across accepted and completed jobs</div>
        </div>
      </div>

      <div className="vd-section">
        <h2>Offers waiting for an answer</h2>
        {loading ? (
          <p className="vd-msg">Loading…</p>
        ) : error ? (
          <p className="vd-msg error">{error}</p>
        ) : offers.length === 0 ? (
          <div className="vd-empty">
            Nothing waiting. New work shows up here as soon as a coordinator offers it to you.
          </div>
        ) : (
          <div className="vd-jobs">
            {offers.map((offer) => (
              <Link className="vd-job" key={offer.id} href={`/vendor/jobs/${offer.id}`}>
                <div className="top">
                  <span className="title">{offer.serviceLabel}</span>
                  <span className="pay">{offer.payoutLabel ?? "Payout to confirm"}</span>
                </div>
                <div className="meta">
                  <span>{offer.booking?.eventType}</span>
                  <span>{dateOf(offer.booking?.eventDate)}</span>
                  <span>{offer.booking?.headcountBand} guests</span>
                  {offer.booking?.eventZip ? <span>ZIP {offer.booking.eventZip}</span> : null}
                </div>
              </Link>
            ))}
          </div>
        )}
        {offers.length > 0 && (
          <p style={{ marginTop: 14 }}>
            <Link href="/vendor/jobs" style={{ color: "#3b6d11", fontSize: "0.88rem" }}>
              See every job →
            </Link>
          </p>
        )}
      </div>

      {vendor?.serviceTypes?.length ? (
        <div className="vd-section">
          <h2>What you are offered work for</h2>
          <p style={{ color: "var(--tx2)", fontSize: "0.9rem", marginBottom: 12 }}>
            {vendor.serviceTypes.join(", ")}
          </p>
          {/* The vendor cannot edit this — it is what the coordinator has
              listed them for — so the profile page does not pretend otherwise. */}
          <p className="vd-hint">
            To cover more services, ask your coordinator to add them to your profile.
          </p>
        </div>
      ) : null}
    </>
  );
}
